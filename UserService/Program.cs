using Azure.Storage.Blobs;
using Microsoft.EntityFrameworkCore;
using UserService;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<UserServiceDBContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
    {
        policyBuilder.WithOrigins("https://localhost:4200")
                     .AllowAnyMethod()
                     .AllowAnyHeader()
                     .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


//app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");


//forgot password
//app.MapPost("/api/password", async (string email, string title, string text) =>
//{
//    var result = await AddMail.SendMail("manganctnqk@gmail.com", email, title, text);
//    return Results.Ok(result == "success");
//});
app.InitBasicAccountApi();
app.InitBasicInfoAccountApi(builder.Configuration);
app.Run();


