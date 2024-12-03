using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace UserService.AddMail
{
    public class AddMail
    {
        public static async Task<string> SendMail(string to, string subject, string body)
        {
            var messenger = new MailMessage("nguyennrdz123@gmail.com", to, subject, body)
            {
                SubjectEncoding = Encoding.UTF8,
                BodyEncoding = Encoding.UTF8,
                IsBodyHtml = true,
            };

            using var smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                EnableSsl = true,
                Credentials = new NetworkCredential("nguyennrdz123@gmail.com", "heyl njmw paiz tsbt") 
            };

            try
            {
                await smtp.SendMailAsync(messenger);
                return "Success";
            }
            catch (Exception ex)
            {
                return $"Error: {ex.Message}";
            }
        }
    }
}
