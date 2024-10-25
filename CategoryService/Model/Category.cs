using System.ComponentModel.DataAnnotations;

namespace CategoryService.Model;

public class Category
{
    [Key] public int id_category { get; set; }

    public string name { get; set; }
}