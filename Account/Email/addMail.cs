using System.Net;
using System.Net.Mail;
using System.Text;

namespace Account.Email;

public class AddMail
{
    public static async Task<string> SendMail(string from, string to, string subject, string body)
    {
        var message = new MailMessage(from, to, subject, body)
        {
            BodyEncoding = Encoding.UTF8,
            SubjectEncoding = Encoding.UTF8,
            IsBodyHtml = true
        };

        message.ReplyToList.Add(new MailAddress(from));
        message.Sender = new MailAddress(from);

        using var smtp = new SmtpClient("smtp.gmail.com");
        smtp.Port = 587;
        smtp.EnableSsl = true;
        smtp.Credentials = new NetworkCredential("manganctnqk@gmail.com", "pnhd ifwc hzox lfdh");

        try
        {
            await smtp.SendMailAsync(message);
            return "success";
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return ex.Message;
        }
    }
}