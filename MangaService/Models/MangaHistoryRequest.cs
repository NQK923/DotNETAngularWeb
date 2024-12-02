namespace MangaService.Models;

public abstract class MangaHistoryRequest
{
    public int IdAccount { get; set; }
    public int IdManga { get; set; }
    public int IndexChapter { get; set; }
}