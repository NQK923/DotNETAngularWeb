using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CategoryService.Model;

public class Category
{
    [Key] 
    public int IdCategory { get; init; }

    public string Name { get; init; }
    public string Description { get; init; }
}

public class CategoryDetails
{
    public int IdCategory { get; set; }
    
    [ForeignKey("IdCategory")] public Category Category { get; init; }

    public int IdManga { get; set; }
}