namespace Banners.Model;

public class ModelAccount
{
    public int? id_account { get; set; } // Đặt tên theo chuẩn PascalCase
    public string username { get; set; }
    public string password { get; set; }
    public DateTime? banDate { get; set; }
    public bool? role { get; set; }
    public bool? status { get; set; }
    public bool? banComment { get; set; }
}