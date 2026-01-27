using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public class EmployeeRepository(AppDbContext _context) : IEmployeeRepository
    {
        public Task<ApiResponse<ReturnedEmployeeDto>> AddEmployee(Create_UpdateEmployeeDto dto)
        {
            throw new NotImplementedException();

        }

        public Task<ApiResponse<string>> DeleteEmployee(string id)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<List<ReturnedEmployeeDto>>> GetAllEmployees()
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<ReturnedEmployeeDto>> GetEmployeeById(string id)
        {
            throw new NotImplementedException();
        }

        public Task<ApiResponse<ReturnedEmployeeDto>> UpdateEmployee(string id, Create_UpdateEmployeeDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
