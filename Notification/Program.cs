using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Notification.Dbconnect;
using Notification.Model;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<NotificationDbContext>(options =>
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

//get all notification
app.MapGet("/api/notification", async ([FromServices] NotificationDbContext dbContext) =>
{
    var notifications = await dbContext.Notifications.ToListAsync();
    return Results.Ok(notifications);
});

//add new notification
app.MapPost("/api/notification",
    async (ModelNotification notification, [FromServices] NotificationDbContext dbContext) =>
    {
        dbContext.Notifications.Add(notification);
        await dbContext.SaveChangesAsync();
        return Results.Created($"/api/notification/{notification.Id_Notification}", notification);
    });
app.Run();