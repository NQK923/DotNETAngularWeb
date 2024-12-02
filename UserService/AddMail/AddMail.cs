using System.Net;
using System.Net.Mail;
using System.Text;
namespace UserService.AddMail;

public class AddMail
{
    public static async Task<string> SendMail( string to, string subject, string body)
    {

        var messenger = new MailMessage("manganctnqk@gmail.com",to,subject,body)
        {
            SubjectEncoding = Encoding.UTF8,
            BodyEncoding = Encoding.UTF8,
            IsBodyHtml = true,
        };

        using var smtp = new SmtpClient("smtp.gmail.com");
        smtp.Port = 587;
        smtp.EnableSsl = true;
        smtp.Credentials = new NetworkCredential("manganctnqk@gmail.com", "djgn iqlq inil eeuk");
        try
        {
            await smtp.SendMailAsync(messenger);
            return "Success";
        }
        catch (Exception ex)
        {
            return ex.Message;
        }



    }
}