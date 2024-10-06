// Data/NotificationDbContext.cs

using Microsoft.EntityFrameworkCore;
using Notification.Model;

namespace Notification.Data;

public class NotificationDbContext : DbContext
{
    public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options)
    {
    }

    public DbSet<ModelNotification> Notifications { get; set; } // Sửa tên DbSet thành số nhiều

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelNotification>()
            .ToTable("Notification")
            .HasKey(n => n.Id_Notification); // Định nghĩa khóa chính

        modelBuilder.Entity<ModelNotification>()
            .Property(n => n.Id_Notification)
            .ValueGeneratedOnAdd(); // Đặt tự động tăng cho IdNotification
    }
}

public class InfoAccountDbContext : DbContext
{
    public InfoAccountDbContext(DbContextOptions<InfoAccountDbContext> options) : base(options)
    {
    }

    public DbSet<ModelinfoAccount> InfoAccounts { get; set; } // Sửa tên DbSet thành số nhiều

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelinfoAccount>()
            .ToTable("Info_Account")
            .HasKey(n => n.id_account); // Định nghĩa khóa chính

        modelBuilder.Entity<ModelinfoAccount>()
            .Property(n => n.id_account)
            .ValueGeneratedOnAdd(); // Đặt tự động tăng cho IdAccount
    }
}

public class NotificationMangaAccountDbContext : DbContext
{
    public NotificationMangaAccountDbContext(DbContextOptions<NotificationMangaAccountDbContext> options) :
        base(options)
    {
    }

    public DbSet<ModelNotificationMangaAccount> NotificationMangaAccounts { get; set; } // Sửa tên DbSet thành số nhiều

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelNotificationMangaAccount>()
            .ToTable("Notification_Manga_Account")
            .HasKey(n => n.Id_Notification); // Định nghĩa khóa chính

        modelBuilder.Entity<ModelNotificationMangaAccount>()
            .Property(n => n.Id_Notification)
            .ValueGeneratedOnAdd(); // Đặt tự động tăng cho IdAccount
    }
}