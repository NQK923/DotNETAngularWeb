// Data/BannerDbContext.cs

using Banners.Model;
using Microsoft.EntityFrameworkCore;

namespace Banner.Data;

public class BannerDbContext : DbContext
{
    public BannerDbContext(DbContextOptions<BannerDbContext> options) : base(options)
    {
    }

    public DbSet<ModelBanner> Banner { get; set; } // Sửa tên DbSet thành số nhiều

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelBanner>()
            .ToTable("Banner")
            .HasKey(n => n.Id_Banner); // Định nghĩa khóa chính

        modelBuilder.Entity<ModelBanner>()
            .Property(n => n.Id_Banner)
            .ValueGeneratedOnAdd(); // Đặt tự động tăng cho IdBanner
    }
}