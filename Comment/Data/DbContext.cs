using Microsoft.EntityFrameworkCore;

namespace Comment.Data;

public class CommentDbContext(DbContextOptions<CommentDbContext> options) : DbContext(options)
{
    public DbSet<Model.Comment> Comment { get; init; }
    
}