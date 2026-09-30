namespace BookWAis.Api.Models;

public class Session
{
    public int Id {get; set;}
    public string Title {get; set;} = "";
    public int SpeakerId {get; set;} = "";
    public string Room {get; set;} = "";
    public DateTime StartTime { get; set;}
    public DateTime EndTime { get;set;}
    public int Capacity {get; set;}
}