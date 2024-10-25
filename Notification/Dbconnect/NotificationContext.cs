using Microsoft.EntityFrameworkCore;
using Notification.Model;

namespace Notification.Dbconnect;

public class NotificationDbContext(DbContextOptions<NotificationDbContext> options) : DbContext(options)
{
    public DbSet<ModelNotification> Notifications { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelNotification>()
            .ToTable("Notification")
            .HasKey(n => n.Id_Notification);

        modelBuilder.Entity<ModelNotification>()
            .Property(n => n.Id_Notification)
            .ValueGeneratedOnAdd();
    }
}