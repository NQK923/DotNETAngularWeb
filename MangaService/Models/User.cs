using System.ComponentModel.DataAnnotations;

namespace MangaService.Models;

public class User
{
    [Key] public int id_account { get; set; }

    public string username { get; set; }
    public string password { get; set; }
    public DateTime ban_date { get; set; }
    public bool role { get; set; }
    public bool status { get; set; }
}