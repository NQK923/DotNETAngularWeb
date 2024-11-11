using CategoryService.Data;
using CategoryService.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CategoryService.Api;

public static class CategoryDetailsApi
{
    public static void MapCategoryDetailsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/CategoryDetails/get_all", GetAllCategoryDetails);
        app.MapGet("/api/CategoryDetails/{idManga:int}", GetCategoryDetailsByMangaId);
        app.MapPost("/api/CategoryDetails/getIdManga", GetMangaIdsByCategories);
        app.MapPost("/api/add_manga_category", AddCategoryDetails);
        app.MapPut("/api/update_manga_category", UpdateCategoryDetails);
        app.MapDelete("/api/CategoryDetails/delete", DeleteCategoryDetailsByManga);
    }

    private static async Task<IResult> GetAllCategoryDetails(CategoryDbContext dbContext)
    {
        try
        {
            var categories = await dbContext.CategoryDetails.AsNoTracking().ToListAsync();
            return categories.Count == 0
                ? Results.NotFound(new { Message = "No categories found." })
                : Results.Ok(categories);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving category details. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> GetCategoryDetailsByMangaId(int idManga, CategoryDbContext dbContext)
    {
        try
        {
            var categories = await dbContext.CategoryDetails
                .Where(details => details.IdManga == idManga)
                .AsNoTracking()
                .ToListAsync();
            return Results.Ok(categories);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving category details by manga ID. " + ex.Message +
                                   "\n" + ex.StackTrace);
        }
    }

    private static async Task<IResult> GetMangaIdsByCategories(
        [FromBody] List<int> idCategories, CategoryDbContext dbContext)
    {
        try
        {
            var mangaIds = await dbContext.CategoryDetails
                .Where(cd => idCategories.Contains(cd.IdCategory))
                .AsNoTracking()
                .GroupBy(cd => cd.IdManga)
                .Where(g => g.Count() == idCategories.Count)
                .Select(g => g.Key)
                .Distinct()
                .ToListAsync();
            return Results.Ok(mangaIds);
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while retrieving manga IDs by categories. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> AddCategoryDetails(
        List<int> idCategories, CategoryDbContext dbContext)
    {
        try
        {
            if (idCategories.Count < 2) return Results.BadRequest("Invalid category list.");

            var idManga = idCategories[0];
            idCategories.RemoveAt(0);

            var categoryDetailsList = idCategories
                .Select(idCategory => new CategoryDetails { IdManga = idManga, IdCategory = idCategory })
                .ToList();

            await dbContext.AddRangeAsync(categoryDetailsList);
            await dbContext.SaveChangesAsync();

            return Results.Ok();
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while adding category details. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> UpdateCategoryDetails(
        List<int> idCategories, CategoryDbContext dbContext)
    {
        try
        {
            var idManga = idCategories[0];
            idCategories.RemoveAt(0);

            var existingCategories = await dbContext.CategoryDetails
                .Where(details => details.IdManga == idManga)
                .ToListAsync();

            var oldCategoryIds = existingCategories.Select(c => c.IdCategory).ToList();

            var categoriesToRemove = existingCategories.Where(c => !idCategories.Contains(c.IdCategory)).ToList();
            if (categoriesToRemove.Count != 0) dbContext.CategoryDetails.RemoveRange(categoriesToRemove);

            var categoriesToAdd = idCategories.Except(oldCategoryIds)
                .Select(idCategory => new CategoryDetails { IdManga = idManga, IdCategory = idCategory })
                .ToList();
            if (categoriesToAdd.Count != 0) dbContext.CategoryDetails.AddRange(categoriesToAdd);

            await dbContext.SaveChangesAsync();

            return Results.Ok();
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while updating category details. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }

    private static async Task<IResult> DeleteCategoryDetailsByManga(
        CategoryDbContext dbContext, [FromBody] List<int> idCategories)
    {
        try
        {
            if (idCategories.Count == 0) return Results.BadRequest("Invalid category list.");

            var idManga = idCategories[0];
            idCategories.RemoveAt(0);

            var categoriesToDelete = await dbContext.CategoryDetails
                .Where(cd => cd.IdManga == idManga && idCategories.Contains(cd.IdCategory))
                .ToListAsync();

            if (categoriesToDelete.Count == 0)
                return Results.NotFound(new { Message = "No categories found for deletion." });

            dbContext.CategoryDetails.RemoveRange(categoriesToDelete);
            await dbContext.SaveChangesAsync();

            return Results.Ok(new { Message = "Categories deleted successfully" });
        }
        catch (Exception ex)
        {
            return Results.Problem("An error occurred while deleting category details. " + ex.Message + "\n" +
                                   ex.StackTrace);
        }
    }
}