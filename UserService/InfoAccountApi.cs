using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics;
using System.Net.Http;
using UserService.Models;
using static UserService.Models.Requests;

namespace UserService
{
    public static class InfoAccountApi
    {
        public static void InitBasicInfoAccountApi(this IEndpointRouteBuilder endpointRouteBuilder, IConfiguration configuration)
        {
            MapPostAddInfomation(endpointRouteBuilder, configuration);
            MapGetInfoMationAccountByID(endpointRouteBuilder);
            MapPostValidEmail(endpointRouteBuilder);
            MapPutChangeInfoMationAccountByID(endpointRouteBuilder, configuration);
        }

        public static void MapPutChangeInfoMationAccountByID(this IEndpointRouteBuilder endpointRouteBuilder, IConfiguration configuration)
        {
            endpointRouteBuilder.MapPut("/infoAccount/ChangeInfoMationAccountByID", async (HttpRequest request, UserServiceDBContext dBContext) =>
            {
                var form = await request.ReadFormAsync();
                var infoAccountReq = form["infoAccountReq"];
                var file = form.Files["file"];

                var changeInformationRequest = JsonConvert.DeserializeObject<ChangeInformationRequest>(infoAccountReq);

                var infoAccount = await dBContext.infoAccounts.FirstOrDefaultAsync(info => info.id_account == changeInformationRequest.id_account);
                if (infoAccount == null)
                {
                    return Results.BadRequest("Lỗi MapPutChangeInfoMationAccountByID");
                }
                if (infoAccount.email == null && infoAccount.name.Equals(changeInformationRequest.name) && file == null)
                {
                    return Results.Ok(false);
                }
                if (infoAccount.email != null && infoAccount.email.Equals(changeInformationRequest.email) && infoAccount.name.Equals(changeInformationRequest.name) && file == null)
                {
                    return Results.Ok(false);
                }


                if (!string.IsNullOrEmpty(changeInformationRequest.email))
                {
                    using var httpClient = new HttpClient();
                    var response = await httpClient.GetAsync($"https://emailvalidation.abstractapi.com/v1/?api_key=a2d97dea13244bc0bb8ec58a0f5080c7&email={changeInformationRequest.email}");
                    var content = await response.Content.ReadAsStringAsync();
                    var jsonResponse = JObject.Parse(content);
                    bool isSmtpValid = jsonResponse["is_smtp_valid"]["value"].Value<bool>();
                    if (isSmtpValid) { infoAccount.email = changeInformationRequest.email; }
                    else
                    {
                        return Results.Ok("Email không hợp lệ");
                    }
                }
                if (!string.IsNullOrEmpty(changeInformationRequest.name)) { infoAccount.name = changeInformationRequest.name; }
                if (file != null)
                {
                    var blobServiceClient = new BlobServiceClient(configuration["AzureStorage:ConnectionString"]);
                    var blobContainerClient = blobServiceClient.GetBlobContainerClient("avatars");
                    var blobName = $"IA{infoAccount.id_account}.jpg";
                    var blobClient = blobContainerClient.GetBlobClient(blobName);

                    await blobClient.DeleteIfExistsAsync();

                    if (infoAccount.cover_img.Contains("New")) { blobName = $"IA{infoAccount.id_account}.jpg"; }
                    else { blobName = $"NewIA{infoAccount.id_account}.jpg"; }

                    blobClient = blobContainerClient.GetBlobClient(blobName);
                    using (var stream = file.OpenReadStream())
                    {
                        await blobClient.UploadAsync(stream, true);
                    }
                    var properties = await blobClient.GetPropertiesAsync();
                    string img = blobClient.Uri.ToString();
                    infoAccount.cover_img = img;
                    Console.WriteLine("Up ảnh");
                }

                await dBContext.SaveChangesAsync();
                return Results.Ok(infoAccount);
            });
        }


        public static void MapGetInfoMationAccountByID(this IEndpointRouteBuilder endpointRouteBuilder)
        {
            endpointRouteBuilder.MapGet("/infoAccount/GetInfoMationAccountByID", async (int idAccount, UserServiceDBContext dBContext) =>
            {
                var infoAccount = await dBContext.infoAccounts.FirstOrDefaultAsync(info => info.id_account == idAccount);
                if (infoAccount == null)
                {
                    return Results.BadRequest();
                }
                return Results.Ok(infoAccount);
            });
        }

        public static void MapPostValidEmail(this IEndpointRouteBuilder endpointRouteBuilder)
        {
            endpointRouteBuilder.MapPost("/infoAccount/CheckEmailValid", async (string email) =>
            {
                using var httpClient = new HttpClient();
                var response = await httpClient.GetAsync($"https://emailvalidation.abstractapi.com/v1/?api_key=a2d97dea13244bc0bb8ec58a0f5080c7&email={email}");
                var content = await response.Content.ReadAsStringAsync();
                var jsonResponse = JObject.Parse(content);
                bool isSmtpValid = jsonResponse["is_smtp_valid"]["value"].Value<bool>();
                Debug.WriteLine(isSmtpValid);
                Console.WriteLine(isSmtpValid);
                return Results.Ok(isSmtpValid);
            });
        }

        public static void MapPostAddInfomation(this IEndpointRouteBuilder endpointRouteBuilder, IConfiguration configuration)
        {
            endpointRouteBuilder.MapPost("/infoAccount/AddInfomation", async (InfoMationRegisterRequest infoMationRegisterRequest, UserServiceDBContext dBContext) =>
            {

                string img = "";
                if (!infoMationRegisterRequest.img.Equals("https://dotnetmangaimg.blob.core.windows.net/avatars/defaulImage.png"))
                {
                    HttpClient httpClient = new HttpClient();
                    byte[] imageBytes = await httpClient.GetByteArrayAsync(infoMationRegisterRequest.img);

                    var blobServiceClient = new BlobServiceClient(configuration["AzureStorage:ConnectionString"]);
                    var blobContainerClient = blobServiceClient.GetBlobContainerClient("avatars");

                    var blobName = $"IA{infoMationRegisterRequest.idAccount}.jpg";
                    var blobClient = blobContainerClient.GetBlobClient(blobName);

                    using (var stream = new MemoryStream(imageBytes))
                    {
                        // Đặt Content-Type cho blob
                        var blobHttpHeaders = new BlobHttpHeaders
                        {
                            ContentType = "image/jpeg" // Đặt Content-Type là image/jpeg cho file JPG
                        };

                        await blobClient.UploadAsync(stream, new BlobUploadOptions
                        {
                            HttpHeaders = blobHttpHeaders
                        });
                    }
                    img = blobClient.Uri.ToString();
                    var properties = await blobClient.GetPropertiesAsync();
                }
                else
                {
                    img = infoMationRegisterRequest.img;
                }

                var newInfoAccount = new InfoAccount
                {
                    id_account = infoMationRegisterRequest.idAccount,
                    name = infoMationRegisterRequest.name,
                    email = infoMationRegisterRequest.email,
                    cover_img = img // URL của ảnh đã tải lên
                };

                dBContext.infoAccounts.Add(newInfoAccount);
                await dBContext.SaveChangesAsync();

                return Results.Ok();
            });
        }
    }
}
