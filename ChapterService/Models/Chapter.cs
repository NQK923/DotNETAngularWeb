using System.ComponentModel.DataAnnotations;

namespace MangaService.Models;

public class Chapter
{
    [Key] public int id_chapter { get; set; }

    public string title { get; set; }
    public int id_manga { get; set; }
    public int view { get; set; }
    public DateTime created_at { get; set; }
    public int index { get; set; }
}