using System.ComponentModel.DataAnnotations;

namespace infoAccount.Model
{
    public class ModelInfoAccount
    {
        [Key]
        public int? id_account { get; set; } 
        public required string name { get; set; }
        public required string email { get; set; }
        public required string cover_img { get; set; }
    }
}
