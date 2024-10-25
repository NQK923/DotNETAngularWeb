using MangaHistoryService.Model;
using Microsoft.EntityFrameworkCore;

namespace MangaHistoryService.Data;

public class MangaHistoryDbContext(DbContextOptions<MangaHistoryDbContext> options) : DbContext(options)
{
    public DbSet<MangaHistory> Manga_History { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MangaHistory>()
            .HasKey(history => new { history.id_account, history.id_manga });
    }
}