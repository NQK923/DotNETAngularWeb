using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace ChapterService.Data;

public class ChapterDbContext(DbContextOptions<ChapterDbContext> options) : DbContext(options)
{
    public DbSet<Chapter> Chapter { get; set; }
}