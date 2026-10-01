using BookWAis.Api.Data;
using BookWAis.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookWAis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReservationsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<List<Reservation>> GetReservations()
    {
        return await _context.Reservations.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Reservation>> CreateReservation(Reservation reservation)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        var session = await _context.Sessions
            .FromSqlInterpolated($"SELECT * FROM \"Sessions\" WHERE \"Id\" = {reservation.SessionId} FOR UPDATE")
            .FirstOrDefaultAsync();
        if (session == null) return NotFound("Session Not Found!");

        var duplicate = await _context.Reservations.AnyAsync(r =>
            r.UserId == reservation.UserId &&
            r.SessionId == reservation.SessionId
        );
        if (duplicate) return Conflict("You already booked this session!");

        var bookedCount = await _context.Reservations.CountAsync(r => r.SessionId == reservation.SessionId);
        if (bookedCount >= session.Capacity) return Conflict("Session is full");

        _context.Reservations.Add(reservation);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return reservation;
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<Reservation>> DeleteReservation(int id)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        var existingReservation = await _context.Reservations.FindAsync(id);

        if (existingReservation == null) return NotFound();

        await _context.Sessions
            .FromSqlInterpolated($"SELECT * FROM \"Sessions\" WHERE \"Id\" = {existingReservation.SessionId} FOR UPDATE")
            .FirstOrDefaultAsync();

        _context.Reservations.Remove(existingReservation);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return existingReservation;
    }
}