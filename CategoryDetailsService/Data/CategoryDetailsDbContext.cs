using CategoryDetailsService.Model;
using Microsoft.EntityFrameworkCore;

namespace CategoryDetailsService.Data;

public class CategoryDetailsDbContext(DbContextOptions<CategoryDetailsDbContext> options) : DbContext(options)
{
    public DbSet<CategoryDetails> Category_details { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CategoryDetails>()
            .HasKey(cd => new { cd.id_manga, cd.id_category });

        base.OnModelCreating(modelBuilder);
    }
}