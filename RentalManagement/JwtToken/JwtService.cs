using Duende.IdentityServer.Models;
using Microsoft.IdentityModel.Tokens;
using RentalManagement.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.AccessControl;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace RentalManagement.JwtToken
{
    public class JwtService : IJwtService
    {
        private readonly IConfiguration _configuration;
        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public  string GenerateAccessToken(ApplicationUser user, IList<string> roles)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier , user.Id),
                new Claim(ClaimTypes.Name , user.UserName),
            };
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role)); 
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            
            var cred = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(

                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.UtcNow.AddMinutes(15),
                claims: claims,
                signingCredentials: cred

                );
            return new JwtSecurityTokenHandler().WriteToken(token); 
            
                
        }

        public RefreshToken GenerateRefreshToken(out string rawRefreshToken)
        {
            var bytes = new Byte[64];
            RandomNumberGenerator.Fill(bytes);

            rawRefreshToken = Convert.ToBase64String(bytes);

            var hashedToken = SHA256.HashData(Encoding.UTF8.GetBytes(rawRefreshToken));

            return new RefreshToken
            {
                Token = Convert.ToBase64String(hashedToken),
                ExpiresOn = DateTime.UtcNow.AddDays(30),
                IsRevoked = false,
                CreatedOn = DateTime.UtcNow,
                
            };
        }
    }
}
