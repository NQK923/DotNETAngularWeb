using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Notification.Data;
using Notification.Model;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình DbContext cho Notification
builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

// Cấu hình DbContext cho Notification
builder.Services.AddDbContext<NotificationMangaAccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));


// Cấu hình DbContext cho InfoAccount
builder.Services.AddDbContext<InfoAccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Cấu hình Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");
// Định nghĩa điểm cuối API để lấy danh sách thông báo
app.MapGet("/api/notificationMangAccount", async (NotificationMangaAccountDbContext dbContext) =>
{
    var notificationMangaAccount = await dbContext.NotificationMangaAccounts.ToListAsync();
    return Results.Ok(notificationMangaAccount);
});

// Điểm cuối để lấy danh sách tài khoản
app.MapGet("/api/infoaccount", async ([FromServices] InfoAccountDbContext dbContext) =>
{
    var infoAccount = await dbContext.InfoAccounts.ToListAsync();
    return Results.Ok(infoAccount);
});

// Điểm cuối để lấy danh sách thông báo
app.MapGet("/api/notification", async ([FromServices] NotificationDbContext dbContext) =>
{
    var notifications = await dbContext.Notifications.ToListAsync();
    return Results.Ok(notifications);
});

// Điểm cuối để thêm thông báo mới
app.MapPost("/api/notification",
    async (ModelNotification notification, [FromServices] NotificationDbContext dbContext) =>
    {
        dbContext.Notifications.Add(notification);
        await dbContext.SaveChangesAsync();
        return Results.Created($"/api/notification/{notification.Id_Notification}", notification);
    });

app.Run();