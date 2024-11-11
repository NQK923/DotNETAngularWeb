using Account.Email;
using Account.Model;
using Account.WebApplication2;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddDbContext<AccountDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("AzureSQL")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policyBuilder =>
    {
        policyBuilder.WithOrigins("https://localhost:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


//app.UseHttpsRedirection();
app.UseCors("AllowAllOrigins");

// get all account
app.MapGet("/api/Account", async ([FromServices] AccountDbContext dbContext) =>
{
    var accounts = await dbContext.accounts.ToListAsync();
    return Results.Ok(accounts);
});

//get data by id
app.MapGet("/api/Account/data", async (int idAccount, AccountDbContext dbContext) =>
{
    var account = await dbContext.accounts.Where(ac => ac.id_account == idAccount).FirstOrDefaultAsync();
    return Results.Ok(account);
});

app.MapGet("/api/AccountById/{idAccount:int}", async ([FromServices] AccountDbContext dbContext, int idAccount) =>
{
    var account = await dbContext.accounts.FindAsync(idAccount);

    return account == null ? Results.NotFound() : Results.Ok(account);
});

//add new account
app.MapPost("/api/Account", async (ModelAccount account, [FromServices] AccountDbContext dbContext) =>
{
    try
    {
        var exists = await dbContext.accounts
            .AnyAsync(m => m.username == account.username);
        if (exists) return Results.Ok(false);
        dbContext.accounts.Add(account);
        await dbContext.SaveChangesAsync();
        return Results.Ok(account.id_account);
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during account creation: " + ex.Message);
    }
});

//login
app.MapPost("/api/Login", async (ModelAccount account, [FromServices] AccountDbContext dbContext) =>
{
    try
    {
        var existingAccount = await dbContext.accounts
            .FirstOrDefaultAsync(a => a.username == account.username && a.password == account.password);

        return existingAccount != null
            ? Results.Ok(existingAccount.id_account)
            : Results.NotFound("Invalid username or password");
    }
    catch (Exception ex)
    {
        return Results.Problem("An error occurred during the login process: " + ex.Message);
    }
});

//forgot password
app.MapPost("/api/password", async (string email, string title, string text) =>
{
    var result = await AddMail.SendMail("manganctnqk@gmail.com", email, title, text);
    return Results.Ok(result == "success");
});
//"AzureSQL": "Server=LAPTOP-D2AJ1CKN\\SQLEXPRESS;Database=Test;User ID=sa;Password=06112002A@a;Encrypt=True;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true;Connection Timeout=10;"
app.InitBasicAccountApi();
app.Run();