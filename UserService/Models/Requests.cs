namespace UserService.Models
{
    public class Requests
    {
        public record LoginRegisterRequest(string username, string password);
        public record ChangePasswordRequest(int idAccount, string oldPassword, string newPassword);
        public record ChangeStatusRequest(int idAccount, bool status);
        public record ChangeBanDateRequest(int idAccount, DateTime banDate);
        public record CheckOldPasswordRequest(int idAccount, string oldPassword);
        public record ChangeInformationRequest(int idAccount, string name, string cover_img);
    }
}
