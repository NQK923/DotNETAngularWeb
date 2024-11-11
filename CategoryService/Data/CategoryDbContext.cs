using CategoryService.Model;
using Microsoft.EntityFrameworkCore;

namespace CategoryService.Data;

public class CategoryDbContext(DbContextOptions<CategoryDbContext> options) : DbContext(options)
{
    public DbSet<Category> Category { get; init; }

    public DbSet<CategoryDetails> CategoryDetails { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CategoryDetails>()
            .HasKey(cd => new { id_manga = cd.IdManga, id_category = cd.IdCategory });

        base.OnModelCreating(modelBuilder);
    }
}