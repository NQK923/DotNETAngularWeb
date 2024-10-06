namespace Banners.Model;

public class ModelBanner
{
    public int Id_Banner { get; set; } // Đặt tên theo chuẩn PascalCase
    public string url_manga { get; set; }
    public string image_banner { get; set; }
    public DateTime datePosted { get; set; }
}