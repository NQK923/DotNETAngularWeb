using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Notification.Model;
using notificationMangaAccount.Dbconnect;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<NotificationMangaAccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        policyBuilder => policyBuilder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

//get all notification manga account
app.MapGet("/api/notificationMangAccount", async (NotificationMangaAccountDbContext dbContext) =>
{
    var notificationMangaAccount = await dbContext.NotificationMangaAccounts.ToListAsync();
    return Results.Ok(notificationMangaAccount);
});

//get by id account
app.MapGet("/api/notificationMangAccountById/idAccount",
    async (NotificationMangaAccountDbContext dbContext, int idAccount) =>
    {
        var notifications = await dbContext.NotificationMangaAccounts
            .Where(c => c.Id_account == idAccount && c.IsGotNotification == true)
            .ToListAsync();
        return notifications.Count == 0 ? Results.NotFound() : Results.Ok(notifications);
    });

//add new notification manga account
app.MapPost("/api/notificationMangAccount",
    async (ModelNotificationMangaAccount notification, [FromServices] NotificationMangaAccountDbContext dbContext) =>
    {
        dbContext.NotificationMangaAccounts.Add(notification);
        await dbContext.SaveChangesAsync();
        return Results.Created($"/api/notification/{notification.Id_Notification}", notification);
    });
//update notification manga account
app.MapPut("/api/notificationMangAccount", async (ModelNotificationMangaAccount notification,
    [FromServices] NotificationMangaAccountDbContext dbContext) =>
{
    try
    {
        dbContext.NotificationMangaAccounts.Update(notification);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account creation: " + ex.Message);
    }
});

//change status
app.MapPut("/api/notificationMangAccount/status",
    async (int idNotification, NotificationMangaAccountDbContext dbContext) =>
    {
        var notification = await dbContext.NotificationMangaAccounts.FindAsync(idNotification);
        if (notification != null) notification.is_read = true;
        await dbContext.SaveChangesAsync();
    });

app.Run();