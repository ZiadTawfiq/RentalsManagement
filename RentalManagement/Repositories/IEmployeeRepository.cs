using RentalManagement.DTOs;
namespace RentalManagement.Repositories
{
    public interface IEmployeeRepository
    {
        Task <ApiResponse<ReturnedEmployeeDto>> AddEmployee(Create_UpdateEmployeeDto dto);
        Task <ApiResponse<ReturnedEmployeeDto>> UpdateEmployee(string id, Create_UpdateEmployeeDto dto);
        Task <ApiResponse<string>> DeleteEmployee(string id);
        Task <ApiResponse<ReturnedEmployeeDto>> GetEmployeeById(string id);
        Task <ApiResponse<List<ReturnedEmployeeDto>>> GetAllEmployees();  
    }
}
