using Microsoft.EntityFrameworkCore;

namespace MangaService;

public class MangaDbContext : DbContext
{
    public MangaDbContext(DbContextOptions<MangaDbContext> options) : base(options)
    {
    }

    public DbSet<Manga> Manga { get; set; }
}