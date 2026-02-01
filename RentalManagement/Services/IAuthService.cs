using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<ReturnedEmployeeDto>>SignUp(SignupDto dto);
        Task<ApiResponse<AuthResponseDto>> Login(LoginDto dto);
<<<<<<< HEAD
        Task<ApiResponse<AuthResponseDto>> RefreshToken(string refreshToken);


=======
        Task<ApiResponse<string>> ChangePassword(ChangePasswordDto dto);
>>>>>>> f932c732ac02780f916491f809fd74fbb96520a8
    }
}
