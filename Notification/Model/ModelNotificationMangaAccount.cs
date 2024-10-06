namespace Notification.Model;

public class ModelNotificationMangaAccount
{
    public int Id_Notification { get; set; }
    public int Id_manga { get; set; } // Đặt tên theo chuẩn PascalCase
    public int Id_account { get; set; }
    public bool IsGotNotification { get; set; }
}