using Azure.Storage.Blobs;
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
        }

        public static void MapPostAddInfomation(this IEndpointRouteBuilder endpointRouteBuilder, IConfiguration configuration)
        {
            endpointRouteBuilder.MapPost("/infoAccount/AddInfomation", async (InfoMationRegisterRequest infoMationRegisterRequest, UserServiceDBContext dBContext) =>
            {
                // Kiểm tra tài khoản có tồn tại
                HttpClient httpClient = new HttpClient();
                byte[] imageBytes = await httpClient.GetByteArrayAsync(infoMationRegisterRequest.img);
                var blobServiceClient = new BlobServiceClient(configuration["AzureStorage:ConnectionString"]);
                var blobContainerClient = blobServiceClient.GetBlobContainerClient("avatars");
                var blobName = $"IA{infoMationRegisterRequest.idAccount}.jpg";
                var blobClient = blobContainerClient.GetBlobClient(blobName);
                using (var stream = new MemoryStream(imageBytes))
                {
                    await blobClient.UploadAsync(stream, overwrite: true);
                }

                var newInfoAccount = new InfoAccount
                {
                    id_account = infoMationRegisterRequest.idAccount,
                    name = infoMationRegisterRequest.name,
                    email = infoMationRegisterRequest.email,
                    cover_img = blobClient.Uri.ToString()
                };
                dBContext.infoAccounts.Add(newInfoAccount);
                await dBContext.SaveChangesAsync();

                return Results.Ok();
            });
        }
    }
}
