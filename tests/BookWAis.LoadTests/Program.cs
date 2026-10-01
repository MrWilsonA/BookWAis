using System.Net.Http.Json;
using NBomber.CSharp;
using NBomber.Http.CSharp;

var httpClient = new HttpClient();

var browseScenario = Scenario.Create("browse_sessions_test", async context =>
{
    var request = Http.CreateRequest(
        "GET",
        "http://localhost:5011/api/Sessions"
    );

    var response = await Http.Send(httpClient, request);

    if (!response.Payload.Value.IsSuccessStatusCode)
    {
        var body = await response.Payload.Value.Content.ReadAsStringAsync();
        Console.WriteLine($"HTTP {(int)response.Payload.Value.StatusCode}: {body}");
    }

    return response;
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
    var userId = 100 + (int)context.InvocationNumber;

    var content = JsonContent.Create(new
    {
        userId = userId,
        sessionId = 3
    });

    var request = Http.CreateRequest(
            "POST",
            "http://localhost:5011/api/Reservations"
        )
        .WithBody(content);

    var response = await Http.Send(httpClient, request);

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

    var request = Http.CreateRequest(
            "PUT",
            "http://localhost:5011/api/Sessions/3"
        )
        .WithBody(content);

    var response = await Http.Send(httpClient, request);

    if (!response.Payload.Value.IsSuccessStatusCode)
    {
        var body = await response.Payload.Value.Content.ReadAsStringAsync();
        Console.WriteLine($"HTTP {(int)response.Payload.Value.StatusCode}: {body}");
    }

    return response;
})
.WithLoadSimulations(
    Simulation.Inject(
        rate: 1,
        interval: TimeSpan.FromSeconds(1),
        during: TimeSpan.FromSeconds(1)
    )
);

NBomberRunner
    .RegisterScenarios(scenario, capacityUpdateScenario)
    .Run();
