using Microsoft.EntityFrameworkCore;
using Notification.Model;

namespace Notification.Data;

public class NotificationDbContext(DbContextOptions<NotificationDbContext> options) : DbContext(options)
{
    public DbSet<Model.Notification> Notifications { get; init; }
    public DbSet<NotificationMangaAccount> NotificationMangaAccounts { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Model.Notification>()
            .ToTable("Notification")
            .HasKey(n => n.IdNotification);

        modelBuilder.Entity<NotificationMangaAccount>()
            .ToTable("Notification_Manga_Account")
            .HasKey(n => n.IdNotification);

        modelBuilder.Entity<NotificationMangaAccount>(entity =>
        {
            entity.Property(n => n.IsRead).HasDefaultValue(false);
            entity.Property(n => n.IsDeleted).HasDefaultValue(false);
        });
    }
}