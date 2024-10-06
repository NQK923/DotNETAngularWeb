using Azure.Storage.Blobs;
using ChapterService;
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
builder.Services.AddDbContext<ChapterDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/manga/{id_manga}/chapters", async (int id_manga, ChapterDbContext dbContext) =>
{
    var chapters = await dbContext.Chapter
        .Where(c => c.id_manga == id_manga)
        .ToListAsync();

    if (!chapters.Any()) return Results.NotFound("No chapters found for this manga.");
    return Results.Ok(chapters);
});

app.MapGet("/manga/{id_manga}/totalviews", async (int id_manga, ChapterDbContext dbContext) =>
{
    var totalViews = await dbContext.Chapter
        .Where(c => c.id_manga == id_manga)
        .SumAsync(c => c.view);
    return Results.Ok(new { TotalViews = totalViews });
});

app.MapGet("/api/manga/{id_manga}/chapters/{index}/images", async (int id_manga, int index) =>
{
    var storageConnectionString =
        "DefaultEndpointsProtocol=https;AccountName=imagemanga;AccountKey=zJC9JdhmhNnA6PlbqyqveGUbuGsM6/vQQ9cT7Xr3t12G1Y9vZYK5NB9cra2sgzhOWwDPMjkhip9Z+AStdvi7Sw==;EndpointSuffix=core.windows.net";

    var containerName = "mangas";
    var prefix = $"{id_manga}/Chapters/{index}";

    var blobServiceClient = new BlobServiceClient(storageConnectionString);
    var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

    var imageUrls = new List<string>();

    await foreach (var blobItem in containerClient.GetBlobsAsync(prefix: prefix))
    {
        var imageUrl = $"https://{blobServiceClient.AccountName}.blob.core.windows.net/{containerName}/{blobItem.Name}";
        imageUrls.Add(imageUrl);
    }

    return Results.Ok(imageUrls);
});

app.MapGet("/manga/{id_manga}/chapter/{index}", async (int id_manga, int index, ChapterDbContext dbContext) =>
{
    var chapters = await dbContext.Chapter
        .Where(c => c.id_manga == id_manga && c.index == index)
        .ToListAsync();

    if (!chapters.Any()) return Results.NotFound("No chapters found.");
    return Results.Ok(chapters);
});

app.MapPut("/manga/{id_chapter}/incrementView", async (int id_chapter, ChapterDbContext dbContext) =>
{
    var chapter = await dbContext.Chapter.FindAsync(id_chapter);
    if (chapter == null) return Results.NotFound("Chapter not found.");
    chapter.view += 1;
    await dbContext.SaveChangesAsync();

    return Results.Ok(chapter);
});

app.UseCors("AllowAllOrigins");
app.Run();