namespace MangaFavoriteService.Model;

public class MangaFavorite
{
    public int id_manga { get; set; }
    public int id_account { get; set; }
    public bool is_favorite { get; set; }

    public bool is_notification { get; set; }
}