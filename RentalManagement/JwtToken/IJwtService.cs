using RentalManagement.Entities;

namespace RentalManagement.JwtToken
{
    public interface IJwtService
    {
        string GenerateAccessToken(ApplicationUser user, IList<string> roles);
        RefreshToken GenerateRefreshToken(out string rawRefreshToken);
    }
}
