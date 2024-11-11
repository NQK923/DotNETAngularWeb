using MangaService.Data;
using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaService.API;

public static class MangaHistoryApi
{
    public static void MapMangaHistoryEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/mangas/history/{idAccount:int}/{idManga:int}", GetHistoryByAccountAndManga);
        app.MapGet("/api/mangas/simple_history/{idAccount:int}", GetLatestHistoryByAccount);
        app.MapPost("/api/mangas/create/history", CreateOrUpdateHistory);
        app.MapDelete("/api/mangas/delete/{idAccount:int}/{idManga:int}", DeleteHistoryByAccountAndManga);
    }

    private static async Task<IResult> GetHistoryByAccountAndManga(int idAccount, int idManga, MangaDbContext dbContext)
    {
        var histories = await dbContext.MangaHistory
            .AsNoTracking()
            .Where(history => history.IdAccount == idAccount && history.IdManga == idManga)
            .ToListAsync();

        return histories.Count == 0
            ? Results.NotFound("No history found for this account and manga.")
            : Results.Ok(histories);
    }

    private static async Task<IResult> GetLatestHistoryByAccount(int idAccount, MangaDbContext dbContext)
    {
        var recentHistories = await dbContext.MangaHistory
            .AsNoTracking()
            .Where(history => history.IdAccount == idAccount)
            .GroupBy(history => history.IdManga)
            .Select(group => group.OrderByDescending(history => history.Time).FirstOrDefault())
            .ToListAsync();

        return Results.Ok(recentHistories);
    }

    private static async Task<IResult> CreateOrUpdateHistory(MangaHistoryRequest request, MangaDbContext dbContext)
    {
        var existingHistory = await dbContext.MangaHistory
            .AsNoTracking()
            .FirstOrDefaultAsync(h =>
                h.IdAccount == request.IdAccount &&
                h.IdManga == request.IdManga &&
                h.IndexChapter == request.IndexChapter);

        if (existingHistory != null)
        {
            existingHistory.Time = DateTime.Now;
        }
        else
        {
            var newHistory = new MangaHistory
            {
                IdAccount = request.IdAccount,
                IdManga = request.IdManga,
                IndexChapter = request.IndexChapter,
                Time = DateTime.Now
            };
            await dbContext.MangaHistory.AddAsync(newHistory);
        }

        await dbContext.SaveChangesAsync();
        return Results.Ok();
    }

    private static async Task<IResult> DeleteHistoryByAccountAndManga(int idAccount, int idManga,
        MangaDbContext dbContext)
    {
        var existingHistory = await dbContext.MangaHistory
            .FirstOrDefaultAsync(h => h.IdAccount == idAccount && h.IdManga == idManga);

        if (existingHistory != null)
        {
            dbContext.MangaHistory.Remove(existingHistory);
            await dbContext.SaveChangesAsync();
            return Results.Ok();
        }

        return Results.NotFound(new { message = "History record not found." });
    }
}