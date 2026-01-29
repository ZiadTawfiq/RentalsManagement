using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<ReturnedEmployeeDto>>SignUp(SignupDto dto);
        Task<ApiResponse<string>> Login(LoginDto dto); 
    }
}
