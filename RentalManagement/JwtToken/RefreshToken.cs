using RentalManagement.Entities;

namespace RentalManagement.JwtToken
{
    public class RefreshToken
    {
        public int Id { get; set; }

        // HASHED TOKEN (يتخزن في DB)
        public string Token { get; set; }

        public DateTime ExpiresOn { get; set; }

        public bool IsRevoked { get; set; }

        // ربط باليوزر
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public DateTime RevokedOn { get; set; }

        
    }
}
