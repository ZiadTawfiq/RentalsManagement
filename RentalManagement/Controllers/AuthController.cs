using Microsoft.AspNetCore.Authorization;
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
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody]LoginDto dto)
        {
            var result = await authService.Login(dto);
            if (!result.IsSuccess)
            {
                return Unauthorized(result);
            }
            return Ok(result);
            
        }
        [HttpPost("signup")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ApiResponse<ReturnedEmployeeDto>>>SignUp(SignupDto dto)
        {
            var result = await authService.SignUp(dto);
            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }
            return Ok(result); 
                
        }
        [HttpPost("ResetPassword")]
        [Authorize(Roles = "Admin")]

        public async Task<ActionResult<ApiResponse<string>>> ResetPassword(ChangePasswordDto dto)
        {
            var result = await authService.ResetPassword(dto);
            if (!result.IsSuccess)
            {
                return BadRequest(result); 
            }
           
            return Ok(result); 

        }

    }
}
