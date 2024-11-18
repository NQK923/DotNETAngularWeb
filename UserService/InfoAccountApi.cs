using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.EntityFrameworkCore;
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

        public static void MapPostAddInfomation(this IEndpointRouteBuilder endpointRouteBuilder, IConfiguration configuration)
        {
            endpointRouteBuilder.MapPost("/infoAccount/AddInfomation", async (InfoMationRegisterRequest infoMationRegisterRequest, UserServiceDBContext dBContext) =>
            {
                // Kiểm tra tài khoản có tồn tại
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
