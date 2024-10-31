using System.ComponentModel.DataAnnotations;

namespace Account.Model
{
    public class ModelAccount
    {
        [Key]
        public int id_account { get; set; }
        public required string username { get; set; }
        public string? password { get; set; }
        public DateTime? banDate { get; set; }
        public required bool role { get; set; }
        public required bool status { get; set; }
    }

}