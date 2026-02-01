using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<ReturnedEmployeeDto>>SignUp(SignupDto dto);
        Task<ApiResponse<AuthResponseDto>> Login(LoginDto dto);
        Task<ApiResponse<AuthResponseDto>> RefreshToken(string refreshToken);


    }
}
