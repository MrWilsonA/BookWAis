using BookWAis.Api.Data;
using BookWAis.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BookWAis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpeakersController : ControllerBase
{
    private readonly AppDbContext _context;

    public SpeakersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<List<Speaker>> GetSpeakers()
    {
        return await _context.Speakers.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Speaker>> CreateSpeaker(Speaker speaker)
    {
        _context.Speakers.Add(speaker);
        await _context.SaveChangesAsync();

        return speaker;
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Speaker>> UpdateSpeaker(int id, Speaker speaker)
    {
        var existingSpeaker = await _context.Speakers.FindAsync(id);

        if (existingSpeaker == null) return NotFound();

        existingSpeaker.Name = speaker.Name;
        existingSpeaker.Profile = speaker.Profile;
        existingSpeaker.Biography = speaker.Biography;
        existingSpeaker.PhotoUrl = speaker.PhotoUrl;

        await _context.SaveChangesAsync();

        return existingSpeaker;
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<Speaker>> DeleteSpeaker(int id)
    {
        var existingSpeaker = await _context.Speakers.FindAsync(id);

        if (existingSpeaker == null) return NotFound();

        _context.Speakers.Remove(existingSpeaker);
        await _context.SaveChangesAsync();

        return existingSpeaker;
    }
}