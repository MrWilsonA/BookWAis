namespace BookWAis.Api.Models;

public class Reservation
{
    public int Id { get; set;}
    public int UserId {get; set;}
    public int SessionID {get; set;}
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
}