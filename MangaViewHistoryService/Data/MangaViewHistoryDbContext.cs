using MangaViewHistoryService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaViewHistoryService.Data;

public class MangaViewHistoryDbContext(DbContextOptions<MangaViewHistoryDbContext> options) : DbContext(options)
{
    public DbSet<MangaViewHistories> MangaViewHistory { get; init; }
}