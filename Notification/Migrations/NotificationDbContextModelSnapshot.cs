﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Notification.Data;

#nullable disable

namespace Notification.Migrations
{
    [DbContext(typeof(NotificationDbContext))]
    partial class NotificationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Notification.Model.Notification", b =>
                {
                    b.Property<int>("IdNotification")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IdNotification"));

                    b.Property<string>("Content")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime>("Time")
                        .HasColumnType("datetime2");

                    b.Property<string>("TypeNoti")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("IdNotification");

                    b.ToTable("Notification", (string)null);
                });

            modelBuilder.Entity("Notification.Model.NotificationMangaAccount", b =>
                {
                    b.Property<int>("IdNotification")
                        .HasColumnType("int");

                    b.Property<int>("IdAccount")
                        .HasColumnType("int");

                    b.Property<int>("IdManga")
                        .HasColumnType("int");

                    b.Property<bool>("IsDeleted")
                        .HasColumnType("bit");

                    b.Property<bool>("IsRead")
                        .HasColumnType("bit");

                    b.HasKey("IdNotification");

                    b.ToTable("Notification_Manga_Account", (string)null);
                });

            modelBuilder.Entity("Notification.Model.NotificationMangaAccount", b =>
                {
                    b.HasOne("Notification.Model.Notification", "Notification")
                        .WithMany()
                        .HasForeignKey("IdNotification")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Notification");
                });
#pragma warning restore 612, 618
        }
    }
}