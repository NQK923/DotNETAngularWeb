using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using MangaService.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
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

//get all active manga
app.MapGet("/api/manga", async (MangaDbContext dbContext) =>
{
    var mangas = await dbContext.Manga
        .AsNoTracking().Where(manga => manga.num_of_chapter > 0 && manga.is_posted == true && manga.is_deleted == false)
        .ToListAsync();
    return Results.Ok(mangas);
});

//get posted new manga
app.MapGet("/api/manga/posted", async (MangaDbContext dbContext) =>
{
    var mangas = await dbContext.Manga
        .AsNoTracking()
        .Where(manga => manga.is_posted == true && manga.is_deleted == false)
        .ToListAsync();
    return Results.Ok(mangas);
});

//get all unPostedManga
app.MapGet("api/manga/unPosted", async (MangaDbContext dbContext) =>
{
    var mangas = await dbContext.Manga.AsNoTracking()
        .Where(manga => manga.is_deleted == false && manga.is_posted == false)
        .ToListAsync();
    return Results.Ok(mangas);
});

//get manga by id
app.MapGet("/api/manga/get/{idManga:int}", async (int idManga, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(idManga);
    return manga == null ? Results.NotFound("Manga not found") : Results.Ok(manga);
});

//get all manga upload by user
app.MapGet("/api/manga/user/{idAccount:int}", async (int idAccount, MangaDbContext dbContext) =>
{
    var mangas = await dbContext.Manga.AsNoTracking()
        .Where(manga => manga.id_account == idAccount && manga.is_deleted == false)
        .ToListAsync();
    return Results.Ok(mangas);
});

//upload manga by user
app.MapPost("api/manga/upload/{idUser:int}", async (HttpRequest request, int idUser, MangaDbContext db) =>
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
        id_account = idUser,
        describe = describe,
        updated_at = DateTime.Now
    };
    db.Manga.Add(manga);
    await db.SaveChangesAsync();

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
    return Results.Ok(manga.id_manga);
});

//update manga by id
app.MapPut("/api/manga/update/{idManga:int}", async (int idManga, HttpRequest request, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(idManga);
    if (manga == null) return Results.NotFound("Manga not found");
    var formCollection = await request.ReadFormAsync();
    var file = formCollection.Files.FirstOrDefault();
    var name = formCollection["name"];
    var author = formCollection["author"];
    var describe = formCollection["describe"];
    manga.name = name;
    manga.author = author;
    manga.describe = describe;
    if (file is { Length: > 0 })
    {
        var folderName = manga.id_manga.ToString();
        const string fileName = "Cover.jpg";

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

//change manga rating
app.MapPut("/api/manga/ratingChange", async (int idManga, int ratedScore, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(idManga);
    if (manga == null) return Results.NotFound(new { message = "Manga not found." });
    var oldRating = manga.rating;
    var oldRatedNum = manga.rated_num;
    var newRatedNum = oldRatedNum + 1;
    manga.rating = (oldRating * oldRatedNum + ratedScore) / newRatedNum;
    manga.rated_num = newRatedNum;
    await dbContext.SaveChangesAsync();
    return Results.Ok(new { manga.id_manga, manga.rating });
});

//Update manga update time
app.MapPut("/api/manga/updateTime", async (int idManga, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(idManga);
    if (manga == null) return Results.NotFound("Manga not found");
    manga.updated_at = DateTime.Now;
    manga.num_of_chapter += 1;
    dbContext.Manga.Update(manga);
    await dbContext.SaveChangesAsync();
    return Results.Ok(new { manga.id_manga, manga.updated_at });
});

//toggle manga status
app.MapPut("/api/manga/changeStatus", async (int idManga, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(idManga);
    if (manga == null) return Results.NotFound("Manga not found");
    manga.is_posted = !manga.is_posted;
    await dbContext.SaveChangesAsync();
    return Results.Ok(new { manga.id_manga, manga.is_posted });
});

//delete manga by id
app.MapDelete("/api/manga/delete/{idManga:int}", async (int idManga, MangaDbContext dbContext) =>
{
    var manga = await dbContext.Manga.FindAsync(idManga);
    if (manga == null) return Results.NotFound("Manga not found");
    var folderName = manga.id_manga.ToString();
    var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
    var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
    await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: folderName))
    {
        var blobClient = blobContainerClient.GetBlobClient(blobItem.Name);
        await blobClient.DeleteIfExistsAsync();
    }

    manga.is_deleted = true;
    dbContext.Manga.Update(manga);
    await dbContext.SaveChangesAsync();

    return Results.Ok($"Manga with id {idManga} has been deleted.");
});
app.UseCors("AllowAllOrigins");
app.Run();