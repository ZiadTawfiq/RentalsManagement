using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IAuthService authService) : ControllerBase
    {
        [HttpPost("refresh")]
        public async Task<ApiResponse<AuthResponseDto>> Refresh(RefreshTokenDto dto)
        {
            return await authService.RefreshToken(dto.RefreshToken);
        }
    }
}
