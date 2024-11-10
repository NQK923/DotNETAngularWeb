using System.ComponentModel.DataAnnotations.Schema;

namespace Notification.Model;

public class Notification
{
    public int IdNotification { get; set; }
    public string Content { get; set; }
    public DateTime Time { get; set; }
    public bool IsRead { get; set; }
    public string TypeNoti { get; set; }
}

public class NotificationMangaAccount
{
    public int IdNotification { get; set; }
    [ForeignKey("IdNotification")] public Notification Notification { get; init; }
    public int IdManga { get; set; }
    public int IdAccount { get; set; }
    public bool IsGotNotification { get; set; }
    public bool IsRead { get; set; }
}