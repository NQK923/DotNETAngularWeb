using Comment.Dbconnect;
using Comment.Model;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<CommentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
        policyBuilder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

//get all comment
app.MapGet("/api/comment", async (CommentDbContext dbContext) =>
{
    var comments = await dbContext.Comment.ToListAsync();
    return Results.Ok(comments);
});

//get by id
app.MapGet("/api/comment/{id_chapter}", async (CommentDbContext dbContext, int id_chapter) =>
{
    var comments =
        await dbContext.Comment.Where(c => c.id_chapter == id_chapter).ToListAsync();

    return comments.Count == 0 ? Results.NotFound() : Results.Ok(comments);
});

//add new comment
app.MapPost("/api/comment", async (ModelComment comment, CommentDbContext dbContext) =>
{
    try
    {
        dbContext.Comment.Add(comment);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

//update comment
app.MapPut("/api/comment", async (ModelComment comment, CommentDbContext dbContext) =>
{
    try
    {
        dbContext.Comment.Update(comment);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account creation: " + ex.Message);
    }
});

//delete comment
app.MapDelete("/api/comment/{id}", async (int id, CommentDbContext dbContext) =>
{
    var comment = await dbContext.Comment.FindAsync(id);
    if (comment == null) return Results.NotFound();

    dbContext.Comment.Remove(comment);
    await dbContext.SaveChangesAsync();
    return Results.Ok(true);
});
app.Run();