using RentalManagement.DTOs;
namespace RentalManagement.Repositories
{
    public interface IEmployeeRepository
    {
        Task <ApiResponse<ReturnedEmployeeDto>> UpdateEmployee(string id, UpdateEmployeeDto dto);
        Task <ApiResponse<string>> DeleteEmployee(string id);
        Task <ApiResponse<ReturnedEmployeeDto>> GetEmployeeById(string id);
        Task <ApiResponse<List<ReturnedEmployeeDto>>> GetAllEmployees();
        Task<ApiResponse<string>> UpdateRoles(string id, List<string> roles);
    }
}
