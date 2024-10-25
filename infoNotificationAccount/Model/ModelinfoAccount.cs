namespace Notification.Model;

public class ModelinfoAccount
{
    public int id_account { get; set; }
    public string name { get; set; } // Đặt tên theo chuẩn PascalCase
    public string email { get; set; }
    public string cover_img { get; set; }
}