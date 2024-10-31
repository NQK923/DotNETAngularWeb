using infoAccount.Dbconnect;
using infoAccount.Model;
using System.Numerics;
using static infoAccount.Model.Requests;

namespace infoAccount
{
    public static class InfoAccountApi
    {
        public static void InitBasicInfoAccountApi(this IEndpointRouteBuilder endpointRouteBuilde)
        {
            MapPostCreateInfoAccount(endpointRouteBuilde);
        }

        public static void MapPostCreateInfoAccount(this IEndpointRouteBuilder endpointRouteBuilder)
        {
            endpointRouteBuilder.MapPost("/infoAccount/CreateInfoAccount", async (CreateInfoAccountRequest createInfoAccount, InfoAccountDbContext dBContext) =>
            {
                ModelInfoAccount newInfoAccount = new ModelInfoAccount
                {
                    id_account = createInfoAccount.idAccount,                 
                    email = createInfoAccount.email,
                    name = createInfoAccount.name,
                    cover_img = createInfoAccount.cover_img
                };

                dBContext.Add(newInfoAccount);
                await dBContext.SaveChangesAsync();
                return Results.Ok(newInfoAccount.id_account);
            });
        }

        public static void MapGetInfoAccount(this IEndpointRouteBuilder endpointRouteBuilder)
        {
            endpointRouteBuilder.MapGet("/infoAccount/GetInfoAccountByID", async (int id, InfoAccountDbContext dBContext) =>
            {
                var InfoAccount = dBContext.infoAccounts.FirstOrDefault(InfoAccount => InfoAccount.id_account == id);
                return Results.Ok(InfoAccount);
            });
        }

        public static void MapPutChangeInfoAccount(this IEndpointRouteBuilder endpointRouteBuilder)
        {

        }
    }
}