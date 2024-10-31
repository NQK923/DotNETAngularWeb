using infoAccount.Model;
using Microsoft.EntityFrameworkCore;
namespace infoAccount.Dbconnect
{

    public class InfoAccountDbContext(DbContextOptions<InfoAccountDbContext> options) : DbContext(options)
    {
        public DbSet<ModelInfoAccount> infoAccounts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ModelInfoAccount>()
                .ToTable("Info_Account");
        }
    }
}