using CategoryDetailsService.Data;
using CategoryDetailsService.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
    {
        policyBuilder.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddDbContext<CategoryDetailsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();

//get all category details
app.MapGet("/api/GetAll_category_details", async (CategoryDetailsDbContext dbContext) =>
{
    var categories = await dbContext.Category_details.AsNoTracking().ToListAsync();

    return categories.Count == 0 ? Results.NotFound(new { Message = "No categories found." }) : Results.Ok(categories);
});

//get category details by manga_id
app.MapGet("/api/category_details/{idManga}", async (int idManga, CategoryDetailsDbContext dbContext) =>
{
    var categories = await dbContext.Category_details.Where(details => details.id_manga == idManga).AsNoTracking()
        .ToListAsync();
    return Results.Ok(categories);
});

//get list manga by list category
app.MapPost("/api/category_details/getIdManga",
    async ([FromBody] List<int> idCategories, CategoryDetailsDbContext dbContext) =>
    {
        var mangaIds = await dbContext.Category_details
            .Where(cd => idCategories.Contains(cd.id_category))
            .AsNoTracking()
            .GroupBy(cd => cd.id_manga)
            .Where(g => g.Count() == idCategories.Count)
            .Select(g => g.Key)
            .Distinct()
            .ToListAsync();
        return Results.Ok(mangaIds);
    });

//add new category details
app.MapPost("/api/add_manga_category",
    async (List<int> idCategories, CategoryDetailsDbContext dbContext) =>
    {
        if (idCategories.Count < 2) return Results.BadRequest("Invalid category list.");
        var idManga = idCategories[0];
        idCategories.RemoveAt(0);
        Console.WriteLine("Test: " + idCategories[0] + ", idManga: " + idManga);
        var categoryDetailsList = idCategories.Select(t => new CategoryDetails { id_manga = idManga, id_category = t })
            .ToList();
        await dbContext.AddRangeAsync(categoryDetailsList);
        await dbContext.SaveChangesAsync();
        return Results.Ok();
    });

//update manga category details
app.MapPut("/api/update_manga_category",
    async (List<int> idCategories, CategoryDetailsDbContext dbContext) =>
    {
        var idManga = idCategories[0];
        idCategories.RemoveAt(0);
        var categories = await dbContext.Category_details.Where(details => details.id_manga == idManga).ToListAsync();
        var oldId = categories.Select(c => c.id_category).ToList();
        var categoriesToRemove = categories.Where(c => !idCategories.Contains(c.id_category)).ToList();
        if (categoriesToRemove.Count != 0) dbContext.Category_details.RemoveRange(categoriesToRemove);
        var categoriesToAdd = idCategories.Except(oldId).Select(idCategory => new CategoryDetails
        {
            id_manga = idManga,
            id_category = idCategory
        }).ToList();
        if (categoriesToAdd.Count != 0) dbContext.Category_details.AddRange(categoriesToAdd);
        await dbContext.SaveChangesAsync();
        return Results.Ok();
    });
//delete category details by manga
app.MapDelete("/api/category_details/delete",
    async (CategoryDetailsDbContext dbContext, [FromBody] List<int> idCategories) =>
    {
        if (idCategories.Count == 0) return Results.BadRequest("Invalid category list.");
        var idManga = idCategories[0];
        idCategories.RemoveAt(0);
        var categoriesToDelete = await dbContext.Category_details
            .Where(cd => cd.id_manga == idManga && idCategories.Contains(cd.id_category))
            .ToListAsync();
        if (categoriesToDelete.Count == 0)
            return Results.NotFound(new { message = "No categories found for deletion." });

        dbContext.Category_details.RemoveRange(categoriesToDelete);
        await dbContext.SaveChangesAsync();

        return Results.Ok(new { message = "Categories deleted successfully" });
    });

app.UseCors("AllowAllOrigins");
app.Run();