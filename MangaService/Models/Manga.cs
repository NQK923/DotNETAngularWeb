using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MangaService.Models;

public class Manga
{
    [Key] 
    public int IdManga { get; init; }

    public string Name { get; set; }
    public string Author { get; set; }
    public int NumOfChapter { get; set; }
    public double Rating { get; set; }
    public int IdAccount { get; init; }
    public bool IsPosted { get; set; }
    public string CoverImg { get; set; }
    public string Describe { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    public int RatedNum { get; set; }
}

public class MangaFavorite
{
    public int IdManga { get; init; }

    [ForeignKey("IdManga")] public Manga Manga { get; init; }

    public int IdAccount { get; init; }

    public bool IsFavorite { get; set; }
    public bool IsNotification { get; set; }
}

public class MangaHistory
{
    public int IdAccount { get; init; }

    public int IdManga { get; init; }

    [ForeignKey("IdManga")] public Manga Manga { get; init; }

    public int IndexChapter { get; init; }
    public DateTime Time { get; set; }
}

public class MangaViewHistory
{
    public int IdManga { get; init; }

    [ForeignKey("IdManga")] public Manga Manga { get; init; }

    public DateTime Time { get; set; }
}