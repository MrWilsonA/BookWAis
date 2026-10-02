using BookWAis.Api.Data;
using BookWAis.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace BookWAis.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpeakersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IMemoryCache _cache;

    public SpeakersController(AppDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet]
    public async Task<List<Speaker>> GetSpeakers()
    {
        if (_cache.TryGetValue("speakers", out List<Speaker>? speakers) && speakers != null)
            return speakers;

        speakers = await _context.Speakers.AsNoTracking().ToListAsync();
        _cache.Set("speakers", speakers, TimeSpan.FromSeconds(30));
        return speakers;
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Speaker>> CreateSpeaker(Speaker speaker)
    {
        _context.Speakers.Add(speaker);
        await _context.SaveChangesAsync();

        _cache.Remove("speakers");

        return speaker;
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Speaker>> UpdateSpeaker(int id, Speaker speaker)
    {
        var existingSpeaker = await _context.Speakers.FindAsync(id);

        if (existingSpeaker == null) return NotFound();

        existingSpeaker.Name = speaker.Name;
        existingSpeaker.Profile = speaker.Profile;
        existingSpeaker.Biography = speaker.Biography;
        existingSpeaker.PhotoUrl = speaker.PhotoUrl;

        await _context.SaveChangesAsync();

        _cache.Remove("speakers");

        return existingSpeaker;
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<Speaker>> DeleteSpeaker(int id)
    {
        var existingSpeaker = await _context.Speakers.FindAsync(id);

        if (existingSpeaker == null) return NotFound();

        _context.Speakers.Remove(existingSpeaker);
        await _context.SaveChangesAsync();

        _cache.Remove("speakers");

        return existingSpeaker;
    }
}
