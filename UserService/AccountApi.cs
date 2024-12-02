using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UserService.Models;
using static UserService.Models.Requests;
using static UserService.Models.Responses;

namespace UserService;

public static class AccountAPI
{
    public static void InitBasicAccountApi(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        MapPutChangePassword(endpointRouteBuilder); //Đổi mật khẩu
        MapGetListAccount(endpointRouteBuilder); //Lấy danh sách tài khoản
        MapGetAccountByID(endpointRouteBuilder); //Lấy tài khoản theo ID
        MapPostRegister(endpointRouteBuilder); //Đăng ký tài khoản
        MapPutChangeStatus(endpointRouteBuilder); //Thay đổi status
        MapPostLogin(endpointRouteBuilder); //Đăng nhập thường
        MapPostCheckOldPasswordAccountByID(endpointRouteBuilder); //Kiểm tra mật khẩu cũ tài khoản theo ID
        MapGetAccountCookie(endpointRouteBuilder); //Lấy ID tài khoản
        MapPostRegisterExternalAccount(endpointRouteBuilder); //Đăng ký bằng tài khoản bên thứ ba google, facebook
        MapPostCheckExistExternalAccount(
            endpointRouteBuilder); //Kiểm tra tài khoản bên ngoài đã tồn tại trong hệ thống chưa
        MapGetIsLoggedIn(endpointRouteBuilder); //Kiểm tra xem đã đăng nhập web chưa qua cookies có tồn tại hay không ?
        MapPostLogOut(endpointRouteBuilder); //Xóa cookies
        TakePassWord(endpointRouteBuilder);
        GetAccountByUserName(endpointRouteBuilder);
        
    }
    
    //nguyen 
    public static void TakePassWord(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPost("/account/TakePassWord", async (string to, string subject, string body) =>
        {
            try
            {
                var result = await AddMail.AddMail.SendMail(to, subject, body);
                return Results.Ok(result);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }

        });
    }
    public static void GetAccountByUserName(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapGet("/account/GetAccountByUserName", async (UserServiceDBContext dBContext, string user) =>
        {
            try
            {
                var x = await dBContext.accounts.FirstOrDefaultAsync(x => x.username == user);
                return Results.Ok(x);

            }
            catch (Exception ex)
            {
               return Results.BadRequest(ex.Message);
            }

        });
    }

    
   

    public static void MapPutChangePassword(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPut("/account/changePasswordAccountByID",
            async (ChangePasswordRequest changePasswordRequest, UserServiceDBContext dBContext) =>
            {
                var account = await dBContext.accounts.FindAsync(changePasswordRequest.idAccount);
                if (account == null) return Results.BadRequest("Tài khoản không tồn tại");

                if (!account.password.Equals(changePasswordRequest.oldPassword))
                    return Results.BadRequest("Mật khẩu hiện tại không đúng");

                account.password = changePasswordRequest.newPassword;
                return Results.Ok(await dBContext.SaveChangesAsync());
            });
    }

    public static void MapPostCheckOldPasswordAccountByID(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPost("/account/checkOldPasswordAccountByID",
            async (CheckOldPasswordRequest checkOldPasswordRequest, UserServiceDBContext dBContext) =>
            {
                var acccount = await dBContext.accounts.FindAsync(checkOldPasswordRequest.idAccount);
                if (acccount == null) return Results.BadRequest();
                if (checkOldPasswordRequest.oldPassword.Equals(acccount.password)) return Results.Ok(acccount);
                return Results.BadRequest();
            });
    }

    public static void MapGetListAccount(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapGet("/account/getListAccount", async (UserServiceDBContext dBContext) =>
        {
            var list = await dBContext.accounts.ToListAsync();
            if (list.Count == 0) return Results.BadRequest();
            return Results.Ok(list);
        });
    }

    public static void MapGetAccountByID(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapGet("/account/getAccountByID", async (int idAccount, UserServiceDBContext dBContext) =>
        {
            var acccount = await dBContext.accounts.FindAsync(idAccount);
            if (acccount == null) return Results.BadRequest();
            return Results.Ok(acccount);
        });
    }

    // Trả về cookie
    public static void MapPostCheckExistExternalAccount(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPost("/account/checkExistExternalAccount",
            async (string username, HttpContext httpContext, UserServiceDBContext dBContext) =>
            {
                var account = await dBContext.accounts.FirstOrDefaultAsync(account => account.username == username);
                if (account == null) return Results.Ok("Tài khoản chưa tồn tại");
                switch (account.status)
                {
                    case false when account.banDate < DateTime.Now || account.banDate == null:
                        account.status = true;
                        await dBContext.SaveChangesAsync();
                        break;
                    case false when account.banDate > DateTime.Now:
                        return Results.BadRequest(account.banDate);
                }

                CreateCookie(httpContext, GenerateToken(account.id_account, account.role));
                return Results.Ok();
            });
    }

    public static void MapPostRegisterExternalAccount(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPost("/account/registerExternalAccount",
            async (string username, UserServiceDBContext dBContext) =>
            {
                var newAccount = new Account
                {
                    username = username,
                    role = false,
                    status = true
                };

                dBContext.accounts.Add(newAccount);
                await dBContext.SaveChangesAsync();
                return Results.Ok(newAccount.id_account);
            });
    }

    public static void MapGetAccountCookie(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapGet("/account/getAccountCookie", async (HttpContext httpContext) =>
        {
            if (httpContext.Request.Cookies.TryGetValue("loggedIn", out var jwtToken))
            {
                var token = jwtToken;
                var info = DecodeToken(token);

                return Results.Ok(info);
            }

            return Results.Ok(false);
        });
    }

    public static void MapGetIsLoggedIn(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapGet("/account/isLoggedIn", async (HttpContext httpContext) =>
        {
            httpContext.Request.Cookies.TryGetValue("loggedIn", out var jwtToken);
            var token = jwtToken;
            if (token == null) return Results.Ok(false);
            return Results.Ok(true);
        });
    }

    public static void MapPostRegister(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPost("/account/register",
            async (LoginRegisterRequest loginRegisterRequest, UserServiceDBContext dBContext) =>
            {
                // Kiểm tra tài khoản có tồn tại

                var newUsername =
                    await dBContext.accounts.FirstOrDefaultAsync(account =>
                        account.username == loginRegisterRequest.username);

                if (newUsername != null) return Results.BadRequest("Tài khoản đã tồn tại");

                var newAccount = new Account
                {
                    username = loginRegisterRequest.username,
                    password = loginRegisterRequest.password,
                    role = false,
                    status = true
                };

                dBContext.accounts.Add(newAccount);
                await dBContext.SaveChangesAsync();
                return Results.Ok(newAccount.id_account);
            });
    }

    // Trả về cookie
    public static void MapPostLogin(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPost("/account/login",
            async (LoginRegisterRequest loginRegisterRequest, HttpContext httpContext,
                UserServiceDBContext dBContext) =>
            {
                // Kiểm tra tài khoản có tồn tại và nhập đúng mật khẩu
                var account =
                    await dBContext.accounts.FirstOrDefaultAsync(acc => acc.username == loginRegisterRequest.username);
                if (account == null) return Results.BadRequest("Tài khoản không tồn tại");
                if (!account.password.Equals(loginRegisterRequest.password)) return Results.BadRequest("Sai mật khẩu");
                switch (account.status)
                {
                    case false when account.banDate < DateTime.Now || account.banDate == null:
                        account.status = true;
                        await dBContext.SaveChangesAsync();
                        break;
                    case false when account.banDate > DateTime.Now:
                        return Results.BadRequest(account.banDate);
                }

                CreateCookie(httpContext, GenerateToken(account.id_account, account.role));
                return Results.Ok();
            });
    }


    public static void MapPostExternalAccountRegister(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPost("/account/externalAccountRegister",
            async (string username, UserServiceDBContext dBContext) =>
            {
                var newAccount = new Account
                {
                    username = username,
                    role = false,
                    status = true
                };
                var account = await dBContext.accounts.FirstOrDefaultAsync(acc => acc.username == username);
                if (account != null) return Results.Ok(account.id_account);
                return Results.BadRequest("Lỗi đăng nhập");
            });
    }

    //public static void MapGetExternalAccountIsExist(this IEndpointRouteBuilder endpointRouteBuilder)
    //{
    //    endpointRouteBuilder.MapPost("/account/externalLoginIsExist", async (string username, UserServiceDBContext dBContext) =>
    //    {
    //        var account = await dBContext.accounts.FirstOrDefaultAsync(acc => acc.username == username);
    //        if (account == null) return Results.BadRequest("Tài khoản không tồn tại");
    //        if (!account.status) return Results.BadRequest(account.banDate);

    //        return Results.Ok(account.id_account);

    //    });
    //}

    public static void MapPutChangeStatus(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPut("/account/changeStatusAccountByID",
            async (ChangeStatusRequest changeStatusRequest, UserServiceDBContext dBContext) =>
            {
                var account = await dBContext.accounts.FindAsync(changeStatusRequest.idAccount);
                if (account == null) return Results.NotFound();

                account.status = changeStatusRequest.status;

                await dBContext.SaveChangesAsync();
                return Results.Ok();
            });
    }

    public static void MapPutChangeBanDate(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPut("/acccount/changeBanDateAccountByID",
            async (ChangeBanDateRequest changeBanDateRequest, UserServiceDBContext dBContext) =>
            {
                var account = await dBContext.accounts.FindAsync(changeBanDateRequest.idAccount);
                if (account == null) return Results.NotFound();

                account.banDate = changeBanDateRequest.banDate;
                await dBContext.SaveChangesAsync();
                return Results.Ok();
            });
    }

    public static void MapPostLogOut(this IEndpointRouteBuilder endpointRouteBuilder)
    {
        endpointRouteBuilder.MapPost("/account/logOut", (HttpContext httpContext) =>
        {
            DeleteCookie(httpContext, "loggedIn");
            return Results.Ok("Logged out successfully");
        });
    }

    private static string GenerateToken(int idAccount, bool role)
    {
        var claims = new[]
        {
            new Claim("role", role.ToString()),
            new Claim("idAccount", idAccount.ToString()) // Thêm claim cho idAccount
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(
                "yourSuperSecretKey12345678901234567890")); // Đảm bảo khóa có độ dài ít nhất 32 bytes
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            "https://localhost:4200/", // Đặt giá trị issuer
            "https://localhost:4200/", // Đặt giá trị audience
            claims,
            expires: DateTime.Now.AddMonths(1), // Thêm thời gian hết hạn 1 tháng
            signingCredentials: creds);

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);
        return jwt;
    }

    private static AccountCookieResponse DecodeToken(string token)
    {
        var handler = new JwtSecurityTokenHandler();
        var jsonToken = handler.ReadToken(token) as JwtSecurityToken;

        if (jsonToken == null) return null;

        var claims = jsonToken.Claims.Select(c => new { c.Type, c.Value }).ToList();
        var roleClaim = claims.FirstOrDefault(c => c.Type == "role")?.Value;
        var idClaim = claims.FirstOrDefault(c => c.Type == "idAccount")?.Value;

        var id_account = int.Parse(idClaim);
        var role = bool.Parse(roleClaim);
        return new AccountCookieResponse(id_account = id_account, role = role);
    }

    private static void CreateCookie(HttpContext httpContext, string token)
    {
        httpContext.Response.Cookies.Append("loggedIn", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddMonths(1)
        });
    }

    private static void DeleteCookie(HttpContext httpContext, string nameCookie)
    {
        httpContext.Response.Cookies.Delete(nameCookie, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict
        });
    }
}