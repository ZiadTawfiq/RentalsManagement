using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RentalManagement.Entities;
namespace RentalManagement
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
          
        public AppDbContext(DbContextOptions<AppDbContext>options)
            : base(options)
        {

        }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
 
            builder.Entity<Rental>()
                .HasOne(_ => _.SalesRepresentative)
                .WithMany(_ => _.Rentals)
                .HasForeignKey(_ => _.SalesRepresentativeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
        public DbSet<Rental>Rentals { get; set; }
    }
}
