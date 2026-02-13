using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
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
