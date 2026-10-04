using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using NBomber.CSharp;
using NBomber.Http.CSharp;

var testMode = args.FirstOrDefault()?.ToLowerInvariant();
var sessionId = int.TryParse(args.ElementAtOrDefault(1), out var parsedSessionId)
    ? parsedSessionId
    : 1;
var requestedCapacity = int.TryParse(args.ElementAtOrDefault(2), out var parsedCapacity)
    ? parsedCapacity
    : 3;

var httpClient = new HttpClient();
var participantClients = new ConcurrentDictionary<int, Lazy<Task<HttpClient>>>();
var adminClientTask = CreateAuthenticatedClient("WADMIN", "WADMIN", "WADMIN");
var cancellations = new List<(HttpClient Client, int ReservationId)>();
var cancellationIndex = -1;
var bookingIndex = 200;
var bookingPrefix = testMode == "cancellation" ? $"REBOOK{Guid.NewGuid():N}_" : "LOAD";

async Task<HttpClient> CreateAuthenticatedClient(string username, string password, string email)
{
    var handler = new HttpClientHandler
    {
        UseCookies = true,
        CookieContainer = new CookieContainer()
    };
    var client = new HttpClient(handler);
    var register = await client.PostAsJsonAsync(
        "http://localhost:5011/api/auth/register",
        new { username, email, password }
    );

    if (!register.IsSuccessStatusCode)
    {
        var login = await client.PostAsJsonAsync(
            "http://localhost:5011/api/auth/login",
            new { username, password }
        );
        login.EnsureSuccessStatusCode();
    }

    return client;
}

var browseScenario = Scenario.Create("browse_sessions_test", async context =>
{
    var request = Http.CreateRequest("GET", "http://localhost:5011/api/Sessions");
    return await Http.Send(httpClient, request);
})
.WithLoadSimulations(
    Simulation.Inject(
        rate: 1000,
        interval: TimeSpan.FromSeconds(1),
        during: TimeSpan.FromSeconds(1)
    )
);

var scenario = Scenario.Create("booking_test", async context =>
{
    var userNumber = testMode == "cancellation"
        ? Interlocked.Increment(ref bookingIndex)
        : 200 + (int)context.InvocationNumber;
    var client = await participantClients.GetOrAdd(
        userNumber,
        id => new Lazy<Task<HttpClient>>(() => CreateAuthenticatedClient(
            $"{bookingPrefix}{id}",
            "Load123!",
            $"{bookingPrefix}{id}@bookwais.local"
        ))
    ).Value;

    var content = JsonContent.Create(new { sessionId });
    var request = Http.CreateRequest("POST", "http://localhost:5011/api/Reservations")
        .WithBody(content);
    var response = await Http.Send(client, request);

    if (!response.Payload.Value.IsSuccessStatusCode)
    {
        var body = await response.Payload.Value.Content.ReadAsStringAsync();
        Console.WriteLine($"HTTP {(int)response.Payload.Value.StatusCode}: {body}");
    }

    return response;
})
.WithLoadSimulations(
    Simulation.Inject(
        rate: 50,
        interval: TimeSpan.FromSeconds(1),
        during: TimeSpan.FromSeconds(1)
    )
);

var capacityUpdateScenario = Scenario.Create("capacity_update_test", async context =>
{
    var content = JsonContent.Create(new
    {
        title = "ASP.NET Core Workshop",
        speakerId = 1,
        room = "A101",
        startTime = "2026-10-01T09:00:00Z",
        endTime = "2026-10-01T11:00:00Z",
        capacity = requestedCapacity
    });
    var request = Http.CreateRequest("PUT", $"http://localhost:5011/api/Sessions/{sessionId}")
        .WithBody(content);
    return await Http.Send(await adminClientTask, request);
})
.WithLoadSimulations(
    Simulation.Inject(
        rate: 1,
        interval: TimeSpan.FromSeconds(1),
        during: TimeSpan.FromSeconds(1)
    )
);

var cancellationScenario = Scenario.Create("cancellation_test", async context =>
{
    var cancellation = cancellations[Interlocked.Increment(ref cancellationIndex)];
    var request = Http.CreateRequest(
        "DELETE",
        $"http://localhost:5011/api/Reservations/{cancellation.ReservationId}"
    );
    return await Http.Send(cancellation.Client, request);
})
.WithLoadSimulations(
    Simulation.Inject(
        rate: 5,
        interval: TimeSpan.FromSeconds(1),
        during: TimeSpan.FromSeconds(1)
    )
);

var selectedScenarios = testMode switch
{
    "browse" => new[] { browseScenario },
    "booking" => new[] { scenario },
    "capacity" => new[] { scenario, capacityUpdateScenario },
    "cancellation" => new[] { scenario, cancellationScenario },
    _ => throw new ArgumentException("Use browse, booking, capacity, or cancellation.")
};

if (testMode == "cancellation")
{
    var sessions = await httpClient.GetFromJsonAsync<JsonElement[]>("http://localhost:5011/api/Sessions");
    var target = sessions!.FirstOrDefault(item => item.GetProperty("id").GetInt32() == sessionId);
    if (target.ValueKind == JsonValueKind.Undefined || target.GetProperty("remainingSeats").GetInt32() != 0)
        throw new InvalidOperationException("Choose an existing session with no remaining seats.");

    for (var id = 200; id <= 250 && cancellations.Count < 5; id++)
    {
        var client = await CreateAuthenticatedClient($"LOAD{id}", "Load123!", $"load{id}@bookwais.local");
        var reservations = await client.GetFromJsonAsync<List<TestReservation>>("http://localhost:5011/api/Reservations");
        var reservation = reservations!.FirstOrDefault(item => item.SessionId == sessionId);
        if (reservation != null)
            cancellations.Add((client, reservation.Id));
    }

    if (cancellations.Count != 5)
        throw new InvalidOperationException("The selected session needs at least five reservations from LOAD200 to LOAD250.");

    for (var id = 201; id <= 250; id++)
        await participantClients.GetOrAdd(id, number => new Lazy<Task<HttpClient>>(() =>
            CreateAuthenticatedClient($"{bookingPrefix}{number}", "Load123!", $"{bookingPrefix}{number}@bookwais.local"))).Value;

    Console.WriteLine($"Session {sessionId}: capacity {target.GetProperty("capacity").GetInt32()}, remaining seats 0, cancelling 5 reservations.");
}

NBomberRunner
    .RegisterScenarios(selectedScenarios)
    .Run();

if (testMode == "cancellation")
{
    var reservations = await (await adminClientTask).GetFromJsonAsync<List<TestReservation>>("http://localhost:5011/api/Reservations");
    var bookings = reservations!.Where(item => item.SessionId == sessionId).ToList();
    var duplicates = bookings.GroupBy(item => item.UserId).Count(group => group.Count() > 1);
    var cancelledStillPresent = bookings.Count(item => cancellations.Any(cancelled => cancelled.ReservationId == item.Id));
    var sessions = await httpClient.GetFromJsonAsync<JsonElement[]>("http://localhost:5011/api/Sessions");
    var target = sessions!.First(item => item.GetProperty("id").GetInt32() == sessionId);
    Console.WriteLine($"Final reservations: {bookings.Count}; capacity: {target.GetProperty("capacity").GetInt32()}; remaining seats: {target.GetProperty("remainingSeats").GetInt32()}; duplicate users: {duplicates}; cancelled reservations still present: {cancelledStillPresent}.");
}

record TestReservation(int Id, int UserId, int SessionId);
