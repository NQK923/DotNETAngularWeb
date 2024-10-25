// Data/NotificationDbContext.cs

using Microsoft.EntityFrameworkCore;
using Notification.Model;

namespace Notification.Data;

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

