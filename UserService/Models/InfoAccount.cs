using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UserService.Models;

public class InfoAccount
{
    [Key] public int id_infoAccount { get; set; } // Đảm bảo rằng nó có getter và setter

    [ForeignKey("Account")] [Required] public required int id_account { get; set; }

    [Required] public required string name { get; set; }

    public string? email { get; set; }

    [Required] public required string cover_img { get; set; }
}