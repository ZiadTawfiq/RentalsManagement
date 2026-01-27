using Microsoft.AspNetCore.Identity;

namespace RentalManagement.Entities
{
    public class ApplicationUser:IdentityUser
    {
        public double? TotalCommission { get; set; }
        public ICollection<Rental>? Rentals { get; set; }
        public int PropertyId { get; set; }
        public Property Property { get; set; }

    }
}
