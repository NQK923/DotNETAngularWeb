using System.ComponentModel.DataAnnotations;

namespace ChapterService.Models;

public class Chapter
{
    [Key] public int IdChapter { get; set; }

    public string Title { get; set; }
    public int IdManga { get; set; }
    public DateTime CreatedAt { get; set; }
    public int Index { get; set; }
}