using CategoryService.Data;
using Microsoft.EntityFrameworkCore;

namespace CategoryService.Api;

public static class CategoryApi
{
    public static void MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", GetAllCategories);
    }

    private static async Task<IResult> GetAllCategories(CategoryDbContext dbContext)
    {
        try
        {
            var categories = await dbContext.Category
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Results.Ok(categories);
        }
        catch (Exception ex)
        {
            return Results.Problem(
                "An error occurred while retrieving categories. " + ex.Message + "\n" + ex.StackTrace);
        }
    }
}