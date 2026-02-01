using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IEmployeeService
    {
        Task<ApiResponse<string>> DeleteEmployee(string id);
        Task<ApiResponse<List<ReturnedEmployeeDto>>> GetAllEmployees();
        Task<ApiResponse<ReturnedEmployeeDto>> GetEmployeeById(string id);
        Task<ApiResponse<ReturnedEmployeeDto>> UpdateEmployee(string id, UpdateEmployeeDto dto);
    }
}
