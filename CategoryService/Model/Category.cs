using System.ComponentModel.DataAnnotations;

namespace CategoryService.Model;

public class Category
{
    [Key] public int id_category { get; init; }

    public string name { get; init; }
    public string description { get; init; }
}