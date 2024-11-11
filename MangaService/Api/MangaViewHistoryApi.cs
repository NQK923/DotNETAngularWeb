using MangaService.Data;
using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaService.API;

public static class MangaViewHistoryApi
{
    public static void MapMangaViewHistoryEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/manga/getAllView", GetAllViews);
        app.MapGet("/api/manga/getViewByDay", GetViewsByDay);
        app.MapGet("/api/manga/getViewByWeek", GetViewsByWeek);
        app.MapGet("/api/manga/getViewByMonth", GetViewsByMonth);
        app.MapPost("/api/manga/createHistory/{idManga:int}", CreateHistory);
    }

    private static async Task<IResult> GetAllViews(int idManga, MangaDbContext dbContext)
    {
        var totalViews = await dbContext.MangaViewHistory
            .AsNoTracking()
            .Where(mvh => mvh.IdManga == idManga)
            .CountAsync();

        return Results.Ok(totalViews);
    }

    private static async Task<IResult> GetViewsByDay(int idManga, MangaDbContext dbContext)
    {
        var today = DateTime.Today;
        var totalViewsByDay = await dbContext.MangaViewHistory
            .AsNoTracking()
            .Where(mvh => mvh.IdManga == idManga && mvh.Time.Date == today)
            .CountAsync();

        return Results.Ok(totalViewsByDay);
    }

    private static async Task<IResult> GetViewsByWeek(int idManga, MangaDbContext dbContext)
    {
        var startOfWeek = DateTime.Today.AddDays(-(int)DateTime.Today.DayOfWeek);
        var endOfWeek = startOfWeek.AddDays(7);

        var totalViewsByWeek = await dbContext.MangaViewHistory
            .AsNoTracking()
            .Where(mvh => mvh.IdManga == idManga && mvh.Time >= startOfWeek && mvh.Time < endOfWeek)
            .CountAsync();

        return Results.Ok(totalViewsByWeek);
    }

    private static async Task<IResult> GetViewsByMonth(int idManga, MangaDbContext dbContext)
    {
        var startOfMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
        var endOfMonth = startOfMonth.AddMonths(1);

        var totalViewsByMonth = await dbContext.MangaViewHistory
            .AsNoTracking()
            .Where(mvh => mvh.IdManga == idManga && mvh.Time >= startOfMonth && mvh.Time < endOfMonth)
            .CountAsync();

        return Results.Ok(totalViewsByMonth);
    }

    private static async Task<IResult> CreateHistory(int idManga, MangaDbContext dbContext)
    {
        var mh = new MangaViewHistory
        {
            IdManga = idManga,
            Time = DateTime.Now
        };
        dbContext.MangaViewHistory.Add(mh);
        await dbContext.SaveChangesAsync();
        return Results.Ok(mh);
    }
}