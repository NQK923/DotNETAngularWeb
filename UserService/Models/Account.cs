using System.ComponentModel.DataAnnotations;

namespace UserService.Models;

public class Account
{
    [Key] public int id_account { get; set; }

    [Required] public required string username { get; set; }

    public string? password { get; set; }
    public DateTime? banDate { get; set; }

    [Required] public required bool role { get; set; }

    [Required] public required bool status { get; set; }
}