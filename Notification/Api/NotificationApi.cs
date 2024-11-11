using Microsoft.EntityFrameworkCore;
using Notification.Data;

namespace Notification.Api;

public static class NotificationApi
{
    public static void MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/notification", GetAllNotifications);
        app.MapGet("/api/notificationById/{idNotification:int}", GetNotificationById);
        app.MapPost("/api/notification", AddNotification);
    }

    private static async Task<IResult> GetAllNotifications(NotificationDbContext dbContext)
    {
        try
        {
            var notifications = await dbContext.Notifications.ToListAsync();
            return Results.Ok(notifications);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving notifications: {ex.Message}");
        }
    }

    private static async Task<IResult> GetNotificationById(int idNotification, NotificationDbContext dbContext)
    {
        try
        {
            var notification = await dbContext.Notifications
                .FirstOrDefaultAsync(n => n.IdNotification == idNotification);

            return notification == null
                ? Results.NotFound(new { Message = "Notification not found" })
                : Results.Ok(notification);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error retrieving notification by ID: {ex.Message}");
        }
    }

    private static async Task<IResult> AddNotification(Model.Notification notification, NotificationDbContext dbContext)
    {
        try
        {
            dbContext.Notifications.Add(notification);
            await dbContext.SaveChangesAsync();
            return Results.Created($"/api/notification/{notification.IdNotification}", notification);
        }
        catch (Exception ex)
        {
            return Results.Problem($"Error creating notification: {ex.Message}");
        }
    }
}