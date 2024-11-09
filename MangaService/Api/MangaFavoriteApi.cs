using MangaService.Data;
using MangaService.Models;
using Microsoft.EntityFrameworkCore;

namespace MangaService.API;

public static class MangaFavoriteApi
{
    public static void MapMangaFavoriteEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/mangas/favorite", GetAllFavoritesByAccount);
        app.MapGet("/api/mangas/getAllFollower", GetAllFollowersByManga);
        app.MapGet("/api/mangas/isSendNoti", GetAccountsToNotify);
        app.MapGet("/api/mangas/isFavorite", CheckFavoriteStatus);
        app.MapGet("/api/mangas/toggleNotification", ToggleNotificationStatus);
        app.MapPost("/api/mangas/favorite/toggle", ToggleFavoriteStatus);
    }

    private static async Task<IResult> GetAllFavoritesByAccount(int idAccount, MangaDbContext dbContext)
    {
        var favorites = await dbContext.MangaFavorite
            .AsNoTracking()
            .Where(f => f.IdAccount == idAccount && f.IsFavorite)
            .ToListAsync();
        return Results.Ok(favorites);
    }

    private static async Task<IResult> GetAllFollowersByManga(int idManga, MangaDbContext dbContext)
    {
        var totalFollowers = await dbContext.MangaFavorite
            .AsNoTracking()
            .Where(f => f.IdManga == idManga)
            .CountAsync();
        return Results.Ok(totalFollowers);
    }

    private static async Task<IResult> GetAccountsToNotify(int idManga, MangaDbContext dbContext)
    {
        var accountIds = await dbContext.MangaFavorite
            .Where(f => f.IdManga == idManga && f.IsFavorite && f.IsNotification)
            .Select(f => f.IdAccount)
            .ToListAsync();
        return Results.Ok(accountIds);
    }

    private static async Task<IResult> CheckFavoriteStatus(int idAccount, int idManga, MangaDbContext dbContext)
    {
        var favorite = await dbContext.MangaFavorite
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.IdAccount == idAccount && f.IdManga == idManga);
        return Results.Ok(favorite is { IsFavorite: true });
    }

    private static async Task<IResult> ToggleNotificationStatus(int idAccount, int idManga, MangaDbContext dbContext)
    {
        var favorite = await dbContext.MangaFavorite
            .FirstOrDefaultAsync(f => f.IdAccount == idAccount && f.IdManga == idManga);

        if (favorite == null) return Results.NotFound();

        favorite.IsNotification = !favorite.IsNotification;
        await dbContext.SaveChangesAsync();
        return Results.Ok(favorite);
    }

    private static async Task<IResult> ToggleFavoriteStatus(int idAccount, int idManga, MangaDbContext dbContext)
    {
        var favorite = await dbContext.MangaFavorite
            .FirstOrDefaultAsync(f => f.IdAccount == idAccount && f.IdManga == idManga);

        if (favorite != null)
        {
            favorite.IsNotification = favorite switch
            {
                { IsFavorite: true, IsNotification: true } => false,
                { IsFavorite: false, IsNotification: false } => true,
                _ => favorite.IsNotification
            };
            favorite.IsFavorite = !favorite.IsFavorite;
        }
        else
        {
            favorite = new MangaFavorite
            {
                IdAccount = idAccount,
                IdManga = idManga,
                IsFavorite = true,
                IsNotification = true
            };
            await dbContext.MangaFavorite.AddAsync(favorite);
        }

        await dbContext.SaveChangesAsync();
        return Results.Ok(favorite);
    }
}
