using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using NBomber.CSharp;
using NBomber.Http.CSharp;

var httpClient = new HttpClient();
var participantClients = new ConcurrentDictionary<int, Lazy<Task<HttpClient>>>();
var adminClientTask = CreateAuthenticatedClient("WADMIN", "WADMIN", "WADMIN");

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
    var userNumber = 200 + (int)context.InvocationNumber;
    var client = await participantClients.GetOrAdd(
        userNumber,
        id => new Lazy<Task<HttpClient>>(() => CreateAuthenticatedClient(
            $"LOAD{id}",
            "Load123!",
            $"load{id}@bookwais.local"
        ))
    ).Value;

    var content = JsonContent.Create(new { sessionId = 3 });
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
        capacity = 7
    });
    var request = Http.CreateRequest("PUT", "http://localhost:5011/api/Sessions/3")
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
    var reservationId = 6 + (int)context.InvocationNumber;
    var request = Http.CreateRequest(
        "DELETE",
        $"http://localhost:5011/api/Reservations/{reservationId}"
    );
    return await Http.Send(await adminClientTask, request);
})
.WithLoadSimulations(
    Simulation.Inject(
        rate: 5,
        interval: TimeSpan.FromSeconds(1),
        during: TimeSpan.FromSeconds(1)
    )
);

NBomberRunner
    .RegisterScenarios(scenario, cancellationScenario)
    .Run();
