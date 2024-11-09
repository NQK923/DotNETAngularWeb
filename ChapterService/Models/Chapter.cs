using System.ComponentModel.DataAnnotations;

namespace MangaService.Models;

public class Chapter
{
    [Key] public int IdChapter { get; set; }

    public string Title { get; set; }
    public int IdManga { get; set; }
    public int View { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Index { get; set; }
}