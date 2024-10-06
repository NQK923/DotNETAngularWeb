using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace ChapterService;

public class ChapterDbContext : DbContext
{
    public ChapterDbContext(DbContextOptions<ChapterDbContext> options) : base(options)
    {
    }

    public DbSet<Chapter> Chapter { get; set; }
}