using System.Globalization;
using System.Text.RegularExpressions;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using ChapterService.Data;
using MangaService.Models;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.Configure<FormOptions>(options => { options.MultipartBodyLengthLimit = 104857600; });
builder.Services.Configure<IISServerOptions>(options => { options.MaxRequestBodySize = 104857600; });


builder.Services.AddDbContext<ChapterDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

//get all chapter by manga id
app.MapGet("/api/manga/{idManga:int}/chapters", async (int idManga, ChapterDbContext dbContext) =>
{
    var chapters = await dbContext.Chapter
        .AsNoTracking().Where(c => c.id_manga == idManga)
        .ToListAsync();

    return chapters.Count == 0 ? Results.NotFound("No chapters found for this manga.") : Results.Ok(chapters);
});

app.MapGet("/api/manga/getChapterId", async (int idManga, int index, ChapterDbContext dbContext) =>
{
    var chapter = await dbContext.Chapter.AsNoTracking().Where(c => c.id_manga == idManga && c.index == index)
        .FirstOrDefaultAsync();
    return chapter != null ? Results.Ok((object?)chapter.id_chapter) : null;
});

app.MapGet("/api/manga/{idManga:int}/latestChapter", async (int idManga, ChapterDbContext dbContext) =>
{
    var latestChapterIndex = await dbContext.Chapter
        .AsNoTracking().Where(c => c.id_manga == idManga)
        .OrderByDescending(c => c.created_at)
        .Select(c => c.index)
        .FirstOrDefaultAsync();

    return Results.Ok(latestChapterIndex);
});


//get all chapter images by manga id and chapter index
app.MapGet("/api/manga/{idManga:int}/chapters/{index:int}/images", async (int idManga, int index) =>
{
    const string storageConnectionString =
        "DefaultEndpointsProtocol=https;AccountName=mangaimg;AccountKey=ixD9POSbdB6bk18HPlxSo6gdiq4CiklM5/pYl61K36Q45kNTvn/7jnvk9hoe5FcnMQLtoXLysXvO+AStp4kRfQ==;EndpointSuffix=core.windows.net";
    const string containerName = "mangas";
    var prefix = $"{idManga}/Chapters/{index}/";
    var blobServiceClient = new BlobServiceClient(storageConnectionString);
    var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
    var imageUrls = new List<string>();
    await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: prefix))
    {
        var imageUrl = $"https://{blobServiceClient.AccountName}.blob.core.windows.net/{containerName}/{blobItem.Name}";
        imageUrls.Add(imageUrl);
    }

    imageUrls.Sort((a, b) => ExtractNumber(a).CompareTo(ExtractNumber(b)));
    return Results.Ok(imageUrls);

    double ExtractNumber(string url)
    {
        var match = MyRegex().Match(url);
        return match.Success ? double.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture) : 0;
    }
});

//get chapter by manga id and chapter index
app.MapGet("/api/manga/{idManga}/chapter/{index}", async (int idManga, int index, ChapterDbContext dbContext) =>
{
    var chapters = await dbContext.Chapter
        .AsNoTracking().Where(c => c.id_manga == idManga && c.index == index)
        .ToListAsync();

    return chapters.Count == 0 ? Results.NotFound("No chapters found.") : Results.Ok(chapters);
});

//upload single img to azure storage
app.MapPost("/api/manga/upload/chapter/singleImg",
    async (HttpRequest request, IConfiguration configuration) =>
    {
        var formCollection = await request.ReadFormAsync();
        var file = formCollection.Files.FirstOrDefault();
        var idManga = formCollection["id_manga"];
        var index = formCollection["index"];

        if (file == null) return Results.BadRequest("No file uploaded");

        var blobServiceClient = new BlobServiceClient(configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var folderName = idManga.ToString();
        var blobClient = blobContainerClient.GetBlobClient($"{folderName}/Chapters/{index}/{file.FileName}");
        await using var stream = file.OpenReadStream();
        await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });

        return Results.Ok(new { message = "Image uploaded successfully" });
    });

//add new chapter
app.MapPost("/api/manga/upload/chapter",
    async (HttpRequest request, ChapterDbContext db, IHttpClientFactory httpClientFactory) =>
    {
        var formCollection = await request.ReadFormAsync();
        var files = formCollection.Files;
        var title = formCollection["title"];
        var index = formCollection["index"];
        var idManga = formCollection["id_manga"];
        if (files.Count == 0) return Results.BadRequest("No files uploaded");

        var chapterIndex = int.Parse(index);
        var mangaId = int.Parse(idManga);

        var existingChapter = await db.Chapter
            .FirstOrDefaultAsync(c => c.id_manga == mangaId && c.index == chapterIndex);

        if (existingChapter != null)
            return Results.Conflict(new { message = "Chapter index already exists", existingChapter });

        var chapter = new Chapter
        {
            id_manga = mangaId,
            title = title,
            index = chapterIndex,
            created_at = DateTime.Now
        };

        db.Chapter.Add(chapter);
        await db.SaveChangesAsync();

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var folderName = idManga.ToString();

        foreach (var file in files)
        {
            var blobClient = blobContainerClient.GetBlobClient($"{folderName}/Chapters/{index}/{file.FileName}");
            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
        }

        return Results.Ok(new { message = "Chapter added successfully" });
    });

//update chapter
app.MapPut("/api/manga/update/chapter/{chapterId:int}",
    async (int chapterId, HttpRequest request, ChapterDbContext db) =>
    {
        var chapter = await db.Chapter.FindAsync(chapterId);
        if (chapter == null) return Results.NotFound("Chapter not found");

        var formCollection = await request.ReadFormAsync();
        var files = formCollection.Files;
        var title = formCollection["title"];

        chapter.title = title;
        await db.SaveChangesAsync();

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var folderName = chapter.id_manga.ToString();
        var index = chapter.index;

        var oldImagesPrefix = $"{folderName}/Chapters/{index}/";
        await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: oldImagesPrefix))
        {
            var blobClient = blobContainerClient.GetBlobClient(blobItem.Name);
            await blobClient.DeleteIfExistsAsync();
        }

        foreach (var file in files)
        {
            var blobClient = blobContainerClient.GetBlobClient($"{folderName}/Chapters/{index}/{file.FileName}");
            await using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, new BlobHttpHeaders { ContentType = file.ContentType });
        }

        return Results.Ok(new { chapter.id_manga, chapter.index });
    });

//delete chapter by id manga and chapter index
app.MapDelete("/api/manga/delete/{idManga:int}/chapter/{index:int}",
    async (int idManga, int index, ChapterDbContext db) =>
    {
        var chapter = await db.Chapter
            .FirstOrDefaultAsync(c => c.id_manga == idManga && c.index == index);

        if (chapter == null)
            return Results.NotFound("Chapter not found");

        db.Chapter.Remove(chapter);
        await db.SaveChangesAsync();

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var folderName = idManga.ToString();
        var chapterFolderPath = $"{folderName}/Chapters/{index}";

        await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: chapterFolderPath))
        {
            var blobClient = blobContainerClient.GetBlobClient(blobItem.Name);
            await blobClient.DeleteIfExistsAsync();
        }

        return Results.Ok(new { message = "Chapter deleted successfully" });
    });

//delete all chapter by manga id
app.MapDelete("/api/manga/delete/chapters/{idManga:int}",
    async (int idManga, ChapterDbContext db) =>
    {
        var chapters = await db.Chapter
            .Where(c => c.id_manga == idManga)
            .ToListAsync();

        if (chapters.Count == 0)
            return Results.Ok();
        db.Chapter.RemoveRange(chapters);
        await db.SaveChangesAsync();

        var blobServiceClient = new BlobServiceClient(builder.Configuration["AzureStorage:ConnectionString"]);
        var blobContainerClient = blobServiceClient.GetBlobContainerClient("mangas");
        var folderName = idManga.ToString();
        var chapterFolderPath = $"{folderName}/Chapters/";

        await foreach (var blobItem in blobContainerClient.GetBlobsAsync(prefix: chapterFolderPath))
        {
            var blobClient = blobContainerClient.GetBlobClient(blobItem.Name);
            await blobClient.DeleteIfExistsAsync();
        }

        return Results.Ok(new { message = "All chapters deleted successfully" });
    });

//delete single img in storage by img url
app.MapDelete("/api/manga/delete/chapter/singleImg",
    async (string uri, IConfiguration configuration) =>
    {
        if (string.IsNullOrEmpty(uri)) return Results.BadRequest("Invalid URI");
        try
        {
            var blobServiceClient = new BlobServiceClient(configuration["AzureStorage:ConnectionString"]);
            var blobUri = new Uri(uri);
            var containerName = blobUri.Segments[1].TrimEnd('/');
            var blobName = string.Join(string.Empty, blobUri.Segments[2..]);
            var blobContainerClient = blobServiceClient.GetBlobContainerClient(containerName);
            var blobClient = blobContainerClient.GetBlobClient(blobName);
            var deleteResponse = await blobClient.DeleteIfExistsAsync();
            return !deleteResponse.Value
                ? Results.NotFound(new { message = "Image not found" })
                : Results.Ok(new { message = "Image deleted successfully" });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error deleting image: {ex.Message}");
        }
    });


app.UseCors("AllowAllOrigins");
app.Run();

internal partial class Program
{
    [GeneratedRegex(@"\/(\d+(\.\d+)?)\.(jpg|jpeg|png|gif)$", RegexOptions.Compiled)]
    private static partial Regex MyRegex();
}