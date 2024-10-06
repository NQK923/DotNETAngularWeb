namespace Notification.Model;

public class ModelNotification
{
    public int Id_Notification { get; set; } // Đặt tên theo chuẩn PascalCase
    public string Content { get; set; }
    public DateTime Time { get; set; }
    public bool IsRead { get; set; }
    public string Type_Noti { get; set; }
}