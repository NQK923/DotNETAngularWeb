using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Account.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Account
{
    using static Requests;

    namespace WebApplication2
    {
        public static class AccountAPI
        {
            public static void InitBasicAccountApi(this IEndpointRouteBuilder endpointRouteBuilder)
            {
                MapPutChangePassword(endpointRouteBuilder);
                MapGetListAccount(endpointRouteBuilder);
                MapGetAccountByID(endpointRouteBuilder);
                MapPostRegister(endpointRouteBuilder);
                MapPutChangeStatus(endpointRouteBuilder);
                MapPostLogin(endpointRouteBuilder);
                MapPostCheckOldPasswordAccountByID(endpointRouteBuilder);
                MapGetIDAccount(endpointRouteBuilder);
                MapPostRegisterExternalAccount(endpointRouteBuilder);
                MapPostCheckExistExternalAccount(endpointRouteBuilder);
                MapGetIsLoggedIn(endpointRouteBuilder);
            }

            public static void MapPutChangePassword(this IEndpointRouteBuilder endpointRouteBuilder)
            {
                endpointRouteBuilder.MapPut("/account/changePasswordAccountByID",
                    async (ChangePasswordRequest changePasswordRequest, AccountDbContext dBContext) =>
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
                    async (CheckOldPasswordRequest checkOldPasswordRequest, AccountDbContext dBContext) =>
                    {
                        var acccount = await dBContext.accounts.FindAsync(checkOldPasswordRequest.idAccount);
                        if (acccount == null) return Results.BadRequest();
                        if (checkOldPasswordRequest.oldPassword.Equals(acccount.password)) return Results.Ok(acccount);
                        return Results.BadRequest();
                    });
            }

            public static void MapGetListAccount(this IEndpointRouteBuilder endpointRouteBuilder)
            {
                endpointRouteBuilder.MapGet("/account/getListAccount", async (AccountDbContext dBContext) =>
                {
                    var list = await dBContext.accounts.ToListAsync();
                    if (list.Count == 0) return Results.BadRequest();
                    return Results.Ok(list);
                });
            }

            public static void MapGetAccountByID(this IEndpointRouteBuilder endpointRouteBuilder)
            {
                endpointRouteBuilder.MapGet("/account/getAccountByID",
                    async (int idAccount, AccountDbContext dBContext) =>
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
                    async (string username, HttpContext httpContext, AccountDbContext dBContext) =>
                    {
                        var account =
                            await dBContext.accounts.FirstOrDefaultAsync(account => account.username == username);
                        if (account == null) return Results.Ok("Tài khoản chưa tồn tại");
                        CreateCookie(httpContext, GenerateToken(account.id_account, account.role));
                        return Results.Ok();
                    });
            }

            public static void MapPostRegisterExternalAccount(this IEndpointRouteBuilder endpointRouteBuilder)
            {
                endpointRouteBuilder.MapPost("/account/registerExternalAccount",
                    async (string username, AccountDbContext dBContext) =>
                    {
                        // Kiểm tra tài khoản có tồn tại

                        var newAccount = new ModelAccount
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


            public static void MapGetIDAccount(this IEndpointRouteBuilder endpointRouteBuilder)
            {
                endpointRouteBuilder.MapGet("/account/getIDAccount", async (HttpContext httpContext) =>
                {
                    httpContext.Request.Cookies.TryGetValue("loggedIn", out var jwtToken);
                    var token = jwtToken;
                    var info = DecodeToken(token);
                    var idAccount = info.GetType().GetProperty("IdAccount")?.GetValue(info, null);
                    return Results.Ok(idAccount);
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
                    async (LoginRegisterRequest loginRegisterRequest, AccountDbContext dBContext) =>
                    {
                        // Kiểm tra tài khoản có tồn tại

                        var newUsername = await dBContext.accounts.FirstOrDefaultAsync(account =>
                            account.username == loginRegisterRequest.username);

                        if (newUsername != null) return Results.BadRequest("Tài khoản đã tồn tại");

                        var newAccount = new ModelAccount
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
                        AccountDbContext dBContext) =>
                    {
                        // Kiểm tra tài khoản có tồn tại và nhập đúng mật khẩu
                        var account =
                            await dBContext.accounts.FirstOrDefaultAsync(acc =>
                                acc.username == loginRegisterRequest.username);
                        if (account == null) return Results.BadRequest("Tài khoản không tồn tại");
                        if (!account.password.Equals(loginRegisterRequest.password))
                            return Results.BadRequest("Sai mật khẩu");
                        if (!account.status) return Results.BadRequest(account.banDate);

                        CreateCookie(httpContext, GenerateToken(account.id_account, account.role));
                        return Results.Ok();
                    });
            }


            public static void MapPostExternalAccountRegister(this IEndpointRouteBuilder endpointRouteBuilder)
            {
                endpointRouteBuilder.MapPost("/account/externalAccountRegister",
                    async (string username, AccountDbContext dBContext) =>
                    {
                        var newAccount = new ModelAccount
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

            public static void MapGetExternalAccountIsExist(this IEndpointRouteBuilder endpointRouteBuilder)
            {
                endpointRouteBuilder.MapPost("/account/externalLoginIsExist",
                    async (string username, AccountDbContext dBContext) =>
                    {
                        var account = await dBContext.accounts.FirstOrDefaultAsync(acc => acc.username == username);
                        if (account == null) return Results.BadRequest("Tài khoản không tồn tại");
                        if (!account.status) return Results.BadRequest(account.banDate);

                        return Results.Ok(account.id_account);
                    });
            }

            public static void MapPutChangeStatus(this IEndpointRouteBuilder endpointRouteBuilder)
            {
                endpointRouteBuilder.MapPut("/account/changeStatusAccountByID",
                    async (ChangeStatusRequest changeStatusRequest, AccountDbContext dBContext) =>
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
                    async (ChangeBanDateRequest changeBanDateRequest, AccountDbContext dBContext) =>
                    {
                        var account = await dBContext.accounts.FindAsync(changeBanDateRequest.idAccount);
                        if (account == null) return Results.NotFound();

                        account.banDate = changeBanDateRequest.banDate;
                        await dBContext.SaveChangesAsync();
                        return Results.Ok();
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

            private static object DecodeToken(string token)
            {
                var handler = new JwtSecurityTokenHandler();
                var jsonToken = handler.ReadToken(token) as JwtSecurityToken;

                if (jsonToken == null) return Results.BadRequest("Invalid token");

                var claims = jsonToken.Claims.Select(c => new { c.Type, c.Value }).ToList();
                var roleClaim = claims.FirstOrDefault(c => c.Type == "role")?.Value;
                var idClaim = claims.FirstOrDefault(c => c.Type == "idAccount")?.Value;

                return new { Role = roleClaim, IdAccount = idClaim };
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
                httpContext.Response.Cookies.Delete(nameCookie);
            }
        }
    }
}