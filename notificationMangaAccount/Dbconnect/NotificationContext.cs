// Data/NotificationDbContext.cs

using Microsoft.EntityFrameworkCore;
using Notification.Model;

namespace notificationMangaAccount.Dbconnect;

public class NotificationMangaAccountDbContext(DbContextOptions<NotificationMangaAccountDbContext> options)
    : DbContext(options)
{
    public DbSet<ModelNotificationMangaAccount> NotificationMangaAccounts { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelNotificationMangaAccount>()
            .ToTable("Notification_Manga_Account")
            .HasKey(n => n.Id_Notification);

        modelBuilder.Entity<ModelNotificationMangaAccount>()
            .Property(n => n.Id_Notification)
            .ValueGeneratedOnAdd();
    }
}