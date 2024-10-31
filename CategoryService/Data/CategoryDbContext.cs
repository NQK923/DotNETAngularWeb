using CategoryService.Model;
using Microsoft.EntityFrameworkCore;

namespace CategoryService.Data;

public class CategoryDbContext(DbContextOptions<CategoryDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories { get; init; }
}