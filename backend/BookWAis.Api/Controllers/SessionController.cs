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
    public async Task<List<Session>> GetSessions()
    {
        return await _context.Sessions.ToListAsync();
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
        var existingSession = await _context.Sessions.FindAsync(id);

        if (existingSession == null)
            return NotFound();

        existingSession.Title = session.Title;
        existingSession.SpeakerId = session.SpeakerId;
        existingSession.Room = session.Room;
        existingSession.StartTime = session.StartTime;
        existingSession.EndTime = session.EndTime;
        existingSession.Capacity = session.Capacity;

        await _context.SaveChangesAsync();

        return existingSession;
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<Session>> DeleteSession(int id)
    {
        var existingSession = await _context.Sessions.FindAsync(id);

        if (existingSession == null)
            return NotFound();

        _context.Sessions.Remove(existingSession);
        await _context.SaveChangesAsync();

        return existingSession;
    }
}