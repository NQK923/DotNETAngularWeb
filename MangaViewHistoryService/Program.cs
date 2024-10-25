using MangaViewHistoryService.Data;
using MangaViewHistoryService.Models;
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
builder.Services.AddDbContext<MangaViewHistoryDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// get manga views by history
app.MapGet("/api/manga/getAllView", async (int idManga, MangaViewHistoryDbContext mangaViewHistoryDbContext) =>
{
    var totalViews = await mangaViewHistoryDbContext.MangaViewHistory
        .AsNoTracking().Where(mvh => mvh.id_manga == idManga)
        .CountAsync();

    return Results.Ok(totalViews);
});

//get manga view by day
app.MapGet("/api/manga/getViewByDay", async (int idManga, MangaViewHistoryDbContext mangaViewHistoryDbContext) =>
{
    var today = DateTime.Today;
    var totalViewsByDay = await mangaViewHistoryDbContext.MangaViewHistory
        .AsNoTracking().Where(mvh => mvh.id_manga == idManga && mvh.time.Date == today)
        .CountAsync();

    return Results.Ok(totalViewsByDay);
});

//get manga view by week
app.MapGet("/api/manga/getViewByWeek", async (int idManga, MangaViewHistoryDbContext mangaViewHistoryDbContext) =>
{
    var startOfWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
    var endOfWeek = startOfWeek.AddDays(7);

    var totalViewsByWeek = await mangaViewHistoryDbContext.MangaViewHistory
        .AsNoTracking().Where(mvh => mvh.id_manga == idManga && mvh.time >= startOfWeek && mvh.time < endOfWeek)
        .CountAsync();

    return Results.Ok(totalViewsByWeek);
});

//get manga view by month
app.MapGet("/api/manga/getViewByMonth", async (int idManga, MangaViewHistoryDbContext mangaViewHistoryDbContext) =>
{
    var startOfMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
    var endOfMonth = startOfMonth.AddMonths(1);

    var totalViewsByMonth = await mangaViewHistoryDbContext.MangaViewHistory
        .AsNoTracking().Where(mvh => mvh.id_manga == idManga && mvh.time >= startOfMonth && mvh.time < endOfMonth)
        .CountAsync();

    return Results.Ok(totalViewsByMonth);
});

//add new history
app.MapPost("/api/manga/createHistory/{idManga:int}",
    async (int idManga, MangaViewHistoryDbContext mangaViewHistoryDbContext) =>
    {
        var mh = new MangaViewHistories
        {
            id_manga = idManga,
            time = DateTime.Now
        };
        mangaViewHistoryDbContext.MangaViewHistory.Add(mh);
        await mangaViewHistoryDbContext.SaveChangesAsync();
        return Results.Ok(mh);
    });

app.UseCors("AllowAllOrigins");
app.Run();