using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MangaService;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
    {
        builder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddDbContext<MangaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/mangas", async (MangaDbContext dbContext) =>
{
    var mangas = await dbContext.Manga.Where(manga => manga.num_of_chapter > 0 && manga.is_posted == true)
        .ToListAsync();
    return Results.Ok(mangas);
});

app.MapGet("/api/mangas/{id_manga}", async (int id_manga, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(id_manga);
    return manga == null ? Results.NotFound("Manga not found") : Results.Ok(manga);
});

app.MapGet("/api/user/{id_account}/mangas/", async (int id_account, MangaDbContext dbContext) =>
{
    var mangas = await dbContext.Manga.Where(manga => manga.id_account == id_account).ToListAsync();
    return Results.Ok(mangas);
});

app.MapPost("api/upload", async (HttpRequest request, MangaDbContext db) =>
{
    var formCollection = await request.ReadFormAsync();
    var file = formCollection.Files.FirstOrDefault();
    var name = formCollection["name"];
    var author = formCollection["author"];
    var describe = formCollection["describe"];

    if (file == null || file.Length == 0) return Results.BadRequest("No file uploaded");

    var manga = new Manga
    {
        name = name,
        author = author,
        id_account = 1,
        describe = describe,
        updated_at = DateTime.Now
    };

    db.Manga.Add(manga);
    await db.SaveChangesAsync();
    var folderName = manga.id_manga.ToString();
    var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
    var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
    var blobClient = blobContainerClient.GetBlobClient($"{folderName}/{file.FileName}");
    await using var stream = file.OpenReadStream();
    await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

    manga.cover_img = blobClient.Uri.ToString();
    db.Manga.Update(manga);
    await db.SaveChangesAsync();

    return Results.Ok(new { manga.id_manga, manga.cover_img });
});

app.MapPut("/api/mangas/{id_manga}", async (int id_manga, HttpRequest request, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(id_manga);
    if (manga == null) return Results.NotFound("Manga not found");
    var formCollection = await request.ReadFormAsync();
    var file = formCollection.Files.FirstOrDefault();
    var name = formCollection["name"];
    var author = formCollection["author"];
    manga.name = name;
    manga.author = author;

    if (file != null && file.Length > 0)
    {
        var folderName = manga.id_manga.ToString();
        var fileName = "Cover.jpg";

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var oldBlobClient = blobContainerClient.GetBlobClient($"{folderName}/{fileName}");
        if (await oldBlobClient.ExistsAsync()) await oldBlobClient.DeleteAsync();
        var newBlobClient = blobContainerClient.GetBlobClient($"{folderName}/{fileName}");
        await using var stream = file.OpenReadStream();
        await newBlobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
        manga.cover_img = newBlobClient.Uri.ToString();
    }

    dbContext.Manga.Update(manga);
    await dbContext.SaveChangesAsync();

    return Results.Ok(new { manga.id_manga, manga.cover_img });
});

app.MapDelete("/api/mangas/{id_manga}", async (int id_manga, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(id_manga);
    if (manga == null) return Results.NotFound("Manga not found");

    dbContext.Manga.Remove(manga);
    await dbContext.SaveChangesAsync();

    return Results.Ok($"Manga with id {id_manga} has been deleted.");
});
app.UseCors("AllowAllOrigins");
app.Run();