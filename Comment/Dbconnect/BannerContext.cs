using Comment.Model;
using Microsoft.EntityFrameworkCore;

namespace Comment.Dbconnect;

public class CommentDbContext(DbContextOptions<CommentDbContext> options) : DbContext(options)
{
    public DbSet<ModelComment> Comment { get; init; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ModelComment>()
            .ToTable("Comment")
            .HasKey(n => n.id_comment);

        modelBuilder.Entity<ModelComment>()
            .Property(n => n.id_comment)
            .ValueGeneratedOnAdd();
    }
}