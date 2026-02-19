using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using RentalManagement.DTOs;
using RentalManagement.Services;
using RentalManagement.Repositories;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;
        private readonly IEmployeeRepository _employeeRepository;

        public EmployeeController(IEmployeeService employeeService, IEmployeeRepository employeeRepository)
        {
            _employeeService = employeeService;
            _employeeRepository = employeeRepository;
        }

        [HttpGet]
        [Authorize(Roles ="Admin,Accountant")]
        public async Task<IActionResult> GetAll()
        {

            var result = await _employeeService.GetAllEmployees();

            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }

            return Ok(result);


        }

        [HttpGet("{id}")]
        [Authorize(Roles ="Admin,Accountant")]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _employeeService.GetEmployeeById(id);
            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpPatch("{id}/roles")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateRoles(string id, [FromBody] List<string> roles)
        {
            var result = await _employeeRepository.UpdateRoles(id, roles);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(string id, UpdateEmployeeDto dto)
        {
            var result = await _employeeService.UpdateEmployee(id, dto);
            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            var result = await _employeeService.DeleteEmployee(id);
            if (!result.IsSuccess)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

    }
}
