using Microsoft.EntityFrameworkCore;

namespace MangaService.Data;

public class MangaDbContext(DbContextOptions<MangaDbContext> options) : DbContext(options)
{
    public DbSet<Manga> Manga { get; set; }
}