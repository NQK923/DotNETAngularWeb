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
        try
        {
            var favorites = await dbContext.MangaFavorite
                .AsNoTracking()
                .Where(f => f.IdAccount == idAccount && f.IsFavorite)
                .ToListAsync();
            return Results.Ok(favorites);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving favorites."+ex.Message+"\n"+ex.StackTrace);
        }
    }

    private static async Task<IResult> GetAllFollowersByManga(int idManga, MangaDbContext dbContext)
    {
        try
        {
            var totalFollowers = await dbContext.MangaFavorite
                .AsNoTracking()
                .Where(f => f.IdManga == idManga)
                .CountAsync();
            return Results.Ok(totalFollowers);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving followers."+ex.Message+"\n"+ex.StackTrace);
        }
    }

    private static async Task<IResult> GetAccountsToNotify(int idManga, MangaDbContext dbContext)
    {
        try
        {
            var accountIds = await dbContext.MangaFavorite
                .Where(f => f.IdManga == idManga && f.IsFavorite && f.IsNotification)
                .Select(f => f.IdAccount)
                .ToListAsync();
            return Results.Ok(accountIds);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving accounts to notify."+ex.Message+"\n"+ex.StackTrace);
        }
    }


    private static async Task<IResult> CheckFavoriteStatus(int idAccount, int idManga, MangaDbContext dbContext)
    {
        try
        {
            var favorite = await dbContext.MangaFavorite
                .AsNoTracking()
                .FirstOrDefaultAsync(f => f.IdAccount == idAccount && f.IdManga == idManga);
            return Results.Ok(favorite is { IsFavorite: true });
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while checking favorite status. " + ex.Message + "\n" + ex.StackTrace);
        }
    }

    private static async Task<IResult> ToggleNotificationStatus(int idAccount, int idManga, MangaDbContext dbContext)
    {
        try
        {
            var favorite = await dbContext.MangaFavorite
                .FirstOrDefaultAsync(f => f.IdAccount == idAccount && f.IdManga == idManga);

            if (favorite == null) return Results.NotFound();

            favorite.IsNotification = !favorite.IsNotification;
            await dbContext.SaveChangesAsync();
            return Results.Ok(favorite);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while toggling notification status. " + ex.Message + "\n" + ex.StackTrace);
        }
    }

    private static async Task<IResult> ToggleFavoriteStatus(int idAccount, int idManga, MangaDbContext dbContext)
    {
        try
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
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while toggling favorite status. " + ex.Message + "\n" + ex.StackTrace);
        }
    }

}