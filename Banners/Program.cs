using Banner.Data;
using Banners.Model;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure the database context
builder.Services.AddDbContext<BannerDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Add services for Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

// Define API endpoint to get banners
app.MapGet("/api/banner", async (BannerDbContext dbContext) =>
{
    var banners = await dbContext.Banner.ToListAsync();
    return Results.Ok(banners);
});

// Define API endpoint to add a new banner
app.MapPost("/api/banner", async (ModelBanner banner, BannerDbContext dbContext) =>
{
    try
    {
        dbContext.Banner.Add(banner);
        await dbContext.SaveChangesAsync();
        return Results.Ok(true); // Trả về true nếu thêm thành công
    }
    catch (Exception ex)
    {
        // Ghi lại lỗi nếu cần thiết
        return Results.Ok(false); // Trả về false nếu có lỗi
    }
});
//delete
app.MapDelete("/api/banner/{id}", async (int id, BannerDbContext dbContext) =>
{
    var banner = await dbContext.Banner.FindAsync(id);
    if (banner == null) return Results.NotFound(); // Trả về 404 nếu không tìm thấy banner

    dbContext.Banner.Remove(banner);
    await dbContext.SaveChangesAsync();
    return Results.Ok(true); // Trả về true nếu xóa thành công
});
// Run the application
app.Run();