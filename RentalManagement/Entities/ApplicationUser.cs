using Microsoft.AspNetCore.Identity;

namespace RentalManagement.Entities
{
    public class ApplicationUser:IdentityUser
    {
        public decimal? TotalCommission { get; set; }
        public ICollection<Rental>? Rentals { get; set; }

    }
}
