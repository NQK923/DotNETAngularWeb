// Data/NotificationDbContext.cs

using Microsoft.EntityFrameworkCore;
using Notification.Model;

namespace infoNotificationAccount.Dbconnect;

public class InfoAccountDbContext(DbContextOptions<InfoAccountDbContext> options) : DbContext(options)
{
    public DbSet<ModelinfoAccount> InfoAccounts { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelinfoAccount>()
            .ToTable("Info_Account")
            .HasKey(n => n.id_account);

        modelBuilder.Entity<ModelinfoAccount>()
            .Property(n => n.id_account)
            .ValueGeneratedOnAdd();
    }
}