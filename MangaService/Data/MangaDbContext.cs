using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaService.Data;

public class MangaDbContext(DbContextOptions<MangaDbContext> options) : DbContext(options)
{
    public DbSet<Manga> Manga { get; init; }
    public DbSet<MangaHistory> MangaHistory { get; init; }
    public DbSet<MangaFavorite> MangaFavorite { get; init; }
    public DbSet<MangaViewHistory> MangaViewHistory { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MangaFavorite>().HasKey(mf => new { mf.IdManga, mf.IdAccount });
        modelBuilder.Entity<MangaHistory>().HasKey(mh => new { mh.IdManga, mh.IdAccount });
        modelBuilder.Entity<MangaViewHistory>().HasKey(mvh => new { mvh.IdManga, mvh.Time });
    }
}