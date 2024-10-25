namespace Banners.Model;

public class ModelInfoAccount
{
    public int id_account { get; set; } // Đặt tên theo chuẩn PascalCase
    public string? name { get; set; }
    public string? email { get; set; }
    public string? cover_img { get; set; }
}