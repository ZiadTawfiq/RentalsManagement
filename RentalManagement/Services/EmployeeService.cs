using RentalManagement.DTOs;
using RentalManagement.Repositories;

namespace RentalManagement.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;

        public EmployeeService(IEmployeeRepository employeeRepository)
        {
            _employeeRepository = employeeRepository;
        }

        public Task<ApiResponse<string>> DeleteEmployee(string id)
            => _employeeRepository.DeleteEmployee(id);

        public Task<ApiResponse<List<ReturnedEmployeeDto>>> GetAllEmployees()
            => _employeeRepository.GetAllEmployees();

        public Task<ApiResponse<ReturnedEmployeeDto>> GetEmployeeById(string id)
            => _employeeRepository.GetEmployeeById(id);

        public Task<ApiResponse<ReturnedEmployeeDto>> UpdateEmployee(string id, UpdateEmployeeDto dto)
            => _employeeRepository.UpdateEmployee(id, dto);


    }

}
