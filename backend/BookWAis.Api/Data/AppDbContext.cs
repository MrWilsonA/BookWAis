using BookWAis.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BookWAis.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
    : base(options)
    {
        
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Speaker> Speakers { get; set; }
    public DbSet<Session> Sessions { get; set; }
    public DbSet<Reservation> Reservations { get; set; }
}