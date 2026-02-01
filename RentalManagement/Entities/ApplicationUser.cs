using Microsoft.AspNetCore.Identity;
using RentalManagement.JwtToken;

namespace RentalManagement.Entities
{
    public class ApplicationUser:IdentityUser
    {
        public int PropertyId { get; set; }
        public Property Property { get; set; }
        public decimal? CachedTotalCommission { get; set; }
        public DateTime? CommissionLastUpdatedAt { get; set; }
        public ICollection<RentalSales> RentalSales { get; set; } = new List<RentalSales>(); 
        public ICollection<RefreshToken>RefreshTokens { get; set; }


    }
}
