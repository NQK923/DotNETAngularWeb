using Microsoft.EntityFrameworkCore;
using UserService.Models;

namespace UserService;

public class UserServiceDBContext : DbContext
{
    public UserServiceDBContext(DbContextOptions<UserServiceDBContext> options) : base(options)
    {
    }

    public DbSet<Account> accounts { get; set; }
    public DbSet<InfoAccount> infoAccounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>()
            .ToTable("Account");
        modelBuilder.Entity<InfoAccount>()
            .ToTable("InfoAccount");
    }
}