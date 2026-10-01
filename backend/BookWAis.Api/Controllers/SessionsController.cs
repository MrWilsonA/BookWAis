using BookWAis.Api.Data;
using BookWAis.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookWAis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SessionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SessionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSessions()
    {
        var sessions = await _context.Sessions
            .Select(s => new
            {
                s.Id,
                s.Title,
                s.SpeakerId,
                s.Room,
                s.StartTime,
                s.EndTime,
                s.Capacity,
                RemainingSeats = s.Capacity - _context.Reservations.Count(r => r.SessionId == s.Id)
            })
            .ToListAsync();
        
        return Ok(sessions);
    }

    [HttpPost]
    public async Task<ActionResult<Session>> CreateSession(Session session)
    {
        _context.Sessions.Add(session);
        await _context.SaveChangesAsync();

        return session;
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Session>> UpdateSession(int id, Session session)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var existingSession = await _context.Sessions
            .FromSqlInterpolated($"SELECT * FROM \"Sessions\" WHERE \"Id\" = {id} FOR UPDATE")
            .FirstOrDefaultAsync();

        if (existingSession == null) return NotFound();

        var bookedCount = await _context.Reservations.CountAsync(r => r.SessionId == id);

        if (session.Capacity < bookedCount)
            return Conflict("Capacity cannot be lower than current reservations");

        existingSession.Title = session.Title;
        existingSession.SpeakerId = session.SpeakerId;
        existingSession.Room = session.Room;
        existingSession.StartTime = session.StartTime;
        existingSession.EndTime = session.EndTime;
        existingSession.Capacity = session.Capacity;

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return existingSession;
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<Session>> DeleteSession(int id)
    {
        var existingSession = await _context.Sessions.FindAsync(id);

        if (existingSession == null) return NotFound();

        _context.Sessions.Remove(existingSession);
        await _context.SaveChangesAsync();

        return existingSession;
    }
}