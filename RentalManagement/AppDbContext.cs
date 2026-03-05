using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RentalManagement.Entities;

namespace RentalManagement
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // User → Property
            builder.Entity<ApplicationUser>()
                .HasOne(u => u.Property)
                .WithMany()
                .HasForeignKey(u => u.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            // RentalSales (Many-to-Many with payload)
            builder.Entity<RentalSales>()
                .HasKey(rs => new { rs.RentalId, rs.SalesRepresentativeId });

            builder.Entity<RentalSales>()
                .HasOne(rs => rs.Rental)
                .WithMany(r => r.RentalSales)
                .HasForeignKey(rs => rs.RentalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<RentalSales>()
                .HasOne(rs => rs.SalesRepresentative)
                .WithMany(u => u.RentalSales)
                .HasForeignKey(rs => rs.SalesRepresentativeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Rental relations
            builder.Entity<Rental>()
                .HasOne(r => r.Owner)
                .WithMany()
                .HasForeignKey(r => r.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Rental>()
                .HasOne(r => r.Property)
                .WithMany()
                .HasForeignKey(r => r.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Rental>()
                .HasOne(r => r.Unit)
                .WithMany(u => u.Rentals)
                .HasForeignKey(r => r.UnitId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Rental>()
                .ToTable("Rentals");

            // Rental ↔ Settlement (1 : 1)
            builder.Entity<Rental>()
                .HasOne(r => r.RentalSettlement)
                .WithOne(rs => rs.Rental)
                .HasForeignKey<RentalSettlement>(rs => rs.RentalId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<RentalSettlement>()
                .ToTable("RentalSettlements");

            builder.Entity<RentalNote>()
                .ToTable("RentalNotes")
                .HasOne(rn => rn.Rental)
                .WithMany(r => r.RentalNotes)
                .HasForeignKey(rn => rn.RentalId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<RentalNote>()
                .HasOne(rn => rn.AddedByEmployee)
                .WithMany()
                .HasForeignKey(rn => rn.AddedByEmployeeId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Unit>()
                .ToTable("Units")
                .HasIndex(_ => _.Code)
                .IsUnique();

            builder.Entity<Property>()
                .ToTable("Properties")
                .HasIndex(_ => _.Name)
                .IsUnique();

            builder.Entity<Owner>()
                .ToTable("Owners")
                .HasIndex(_ => _.PhoneNumber)
                .IsUnique();

            builder.Entity<RentalSales>()
                .ToTable("RentalSales");

            builder.Entity<ApplicationUser>()
                .HasIndex(_ => _.UserName)
                .IsUnique();
           
            builder.Entity<FinancialAccount>()
                .HasIndex(_ => _.Name)
                .IsUnique();

            builder.Entity<FinancialTransaction>()
                .HasIndex(_ => _.RentalId);

            // Employee Financials
            builder.Entity<EmployeeFinancialAccount>()
                .HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<EmployeeTransaction>()
                .HasOne(et => et.EmployeeFinancialAccount)
                .WithMany()
                .HasForeignKey(et => et.EmployeeFinancialAccountId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<EmployeeTransaction>()
                .HasOne(et => et.PerformedBy)
                .WithMany()
                .HasForeignKey(et => et.PerformedById)
                .OnDelete(DeleteBehavior.SetNull);

            // Rental Creator
            builder.Entity<Rental>()
                .HasOne(r => r.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(r => r.CreatedByEmployeeId)
                .OnDelete(DeleteBehavior.SetNull);
        }

        public DbSet<Rental> Rentals { get; set; }
        public DbSet<RentalSales> RentalSales { get; set; }
        public DbSet<RentalNote> RentalNotes { get; set; }
        public DbSet<RentalSettlement> RentalSettlements { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<Owner> Owners { get; set; }
        public DbSet<JwtToken.RefreshToken> RefreshTokens { get; set; }
        public DbSet<Campain> Campains { get; set; }
        public DbSet<FinancialAccount> FinancialAccounts { get; set; }
        public DbSet<FinancialTransaction> FinancialTransactions { get; set; }
        public DbSet<EmployeeFinancialAccount> EmployeeFinancialAccounts { get; set; }
        public DbSet<EmployeeTransaction> EmployeeTransactions { get; set; }
    }
}
