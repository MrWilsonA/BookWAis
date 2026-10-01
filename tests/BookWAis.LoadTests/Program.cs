using System.Net.Http.Json;
using NBomber.CSharp;
using NBomber.Http.CSharp;

var httpClient = new HttpClient();

var scenario = Scenario.Create("booking_test", async context =>
{
    var userId = (int)context.InvocationNumber;

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

NBomberRunner
    .RegisterScenarios(scenario)
    .Run();
