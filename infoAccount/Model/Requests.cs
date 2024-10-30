using System.Numerics;

namespace infoAccount.Model
{
    public class Requests
    {
        public record CreateInfoAccountRequest(int? idAccount, string name, string email, string cover_img);
    }
}
