using Microsoft.EntityFrameworkCore;
using Notification.Data;
using Notification.Model;

namespace Notification.Api;

public static class NotificationMangaAccountApi
{
    public static void MapNotificationMangaAccountEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/notificationMangAccount", GetAllNotificationMangaAccounts);
        app.MapGet("/api/notificationMangAccountById/{idAccount:int}", GetNotificationsByAccountId);
        app.MapPost("/api/notificationMangAccount", AddNotificationMangaAccount);
        app.MapPut("/api/notificationMangAccount", UpdateNotificationMangaAccount);
        app.MapPut("/api/notificationMangAccount/status/{idNotification:int}", ChangeNotificationStatus);
    }

    private static async Task<IResult> GetAllNotificationMangaAccounts(NotificationDbContext dbContext)
    {
        try
        {
            var notificationMangaAccounts = await dbContext.NotificationMangaAccounts.ToListAsync();
            return Results.Ok(notificationMangaAccounts);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving notification manga accounts: {ex.Message}");
        }
    }

    private static async Task<IResult> GetNotificationsByAccountId(int idAccount,
        NotificationDbContext dbContext)
    {
        try
        {
            var notifications = await dbContext.NotificationMangaAccounts
                .Where(c => c.IdAccount == idAccount && c.IsGotNotification == true)
                .ToListAsync();

            return notifications.Count == 0
                ? Results.NotFound(new { Message = "No notifications found for the specified account" })
                : Results.Ok(notifications);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving notifications by account ID: {ex.Message}");
        }
    }

    private static async Task<IResult> AddNotificationMangaAccount(NotificationMangaAccount notification,
        NotificationDbContext dbContext)
    {
        try
        {
            dbContext.NotificationMangaAccounts.Add(notification);
            await dbContext.SaveChangesAsync();
            return Results.Created($"/api/notificationMangAccount/{notification.IdNotification}", notification);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error adding new notification: {ex.Message}");
        }
    }

    private static async Task<IResult> UpdateNotificationMangaAccount(NotificationMangaAccount notification,
        NotificationDbContext dbContext)
    {
        try
        {
            dbContext.NotificationMangaAccounts.Update(notification);
            await dbContext.SaveChangesAsync();
            return Results.Ok(new { Success = true, Message = "Notification updated successfully" });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error updating notification: {ex.Message}");
        }
    }

    private static async Task<IResult> ChangeNotificationStatus(int idNotification,
        NotificationDbContext dbContext)
    {
        try
        {
            var notification = await dbContext.NotificationMangaAccounts.FindAsync(idNotification);
            if (notification == null)
            {
                return Results.NotFound(new { Message = "Notification not found" });
            }

            notification.IsRead = true;
            await dbContext.SaveChangesAsync();
            return Results.Ok(new { Success = true, Message = "Notification status updated to read" });
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error updating notification status: {ex.Message}");
        }
    }
}