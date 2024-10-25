// Data/AccountDbContext.cs

using Banners.Model;
using Microsoft.EntityFrameworkCore;

namespace infoAccount.Dbconnect;

public class InfoAccountDbContext(DbContextOptions<InfoAccountDbContext> options) : DbContext(options)
{
    public DbSet<ModelInfoAccount> Account { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelInfoAccount>()
            .ToTable("Info_Account")
            .HasKey(n => n.id_account);

        modelBuilder.Entity<ModelInfoAccount>()
            .Property(n => n.id_account)
            .ValueGeneratedOnAdd();
    }
}