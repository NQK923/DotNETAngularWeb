using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MangaService.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Manga",
                columns: table => new
                {
                    IdManga = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "100000, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Author = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NumOfChapter = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<double>(type: "float", nullable: false),
                    IdAccount = table.Column<int>(type: "int", nullable: false),
                    IsPosted = table.Column<bool>(type: "bit", nullable: false),
                    CoverImg = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Describe = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    RatedNum = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Manga", x => x.IdManga);
                });

            migrationBuilder.CreateTable(
                name: "MangaFavorite",
                columns: table => new
                {
                    IdManga = table.Column<int>(type: "int", nullable: false),
                    IdAccount = table.Column<int>(type: "int", nullable: false),
                    IsFavorite = table.Column<bool>(type: "bit", nullable: false),
                    IsNotification = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MangaFavorite", x => new { x.IdManga, x.IdAccount });
                    table.ForeignKey(
                        name: "FK_MangaFavorite_Manga_IdManga",
                        column: x => x.IdManga,
                        principalTable: "Manga",
                        principalColumn: "IdManga",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MangaHistory",
                columns: table => new
                {
                    IdAccount = table.Column<int>(type: "int", nullable: false),
                    IdManga = table.Column<int>(type: "int", nullable: false),
                    IndexChapter = table.Column<int>(type: "int", nullable: false),
                    Time = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MangaHistory", x => new { x.IdManga, x.IdAccount });
                    table.ForeignKey(
                        name: "FK_MangaHistory_Manga_IdManga",
                        column: x => x.IdManga,
                        principalTable: "Manga",
                        principalColumn: "IdManga",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MangaViewHistory",
                columns: table => new
                {
                    IdManga = table.Column<int>(type: "int", nullable: false),
                    Time = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MangaViewHistory", x => new { x.IdManga, x.Time });
                    table.ForeignKey(
                        name: "FK_MangaViewHistory_Manga_IdManga",
                        column: x => x.IdManga,
                        principalTable: "Manga",
                        principalColumn: "IdManga",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MangaFavorite");

            migrationBuilder.DropTable(
                name: "MangaHistory");

            migrationBuilder.DropTable(
                name: "MangaViewHistory");

            migrationBuilder.DropTable(
                name: "Manga");
        }
    }
}
