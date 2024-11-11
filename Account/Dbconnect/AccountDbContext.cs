using Account.Model;
using Microsoft.EntityFrameworkCore;

public class AccountDbContext(DbContextOptions<AccountDbContext> options) : DbContext(options)
{
    public DbSet<ModelAccount> accounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelAccount>()
            .ToTable("Account");
    }
}