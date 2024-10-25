using System.ComponentModel.DataAnnotations;

namespace MangaViewHistoryService.Models;

public class MangaViewHistories
{
    [Key] public int id_manga { get; set; }

    public DateTime time { get; set; }
}