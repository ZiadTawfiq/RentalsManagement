using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;
using RentalManagement.Entities;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace RentalManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeeFinancialController : ControllerBase
    {
        private readonly IEmployeeFinancialService _employeeFinancialService;

        public EmployeeFinancialController(IEmployeeFinancialService employeeFinancialService)
        {
            _employeeFinancialService = employeeFinancialService;
        }

        [HttpGet("AllAccounts")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllAccounts()
        {
            var result = await _employeeFinancialService.GetAllAccounts();
            return Ok(result);
        }

        [HttpGet("MyAccount")]
        public async Task<IActionResult> GetMyAccount()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var result = await _employeeFinancialService.GetAccountByUserId(userId);
            return Ok(result);
        }

        [HttpPost("Transaction")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> CreateTransaction([FromBody] EmployeeTransactionDto dto)
        {
            var performerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(performerId)) return Unauthorized();

            var result = await _employeeFinancialService.CreateTransaction(dto, performerId);
            return Ok(result);
        }

        [HttpGet("Account/{id}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> GetAccount(int id)
        {
            var result = await _employeeFinancialService.GetAccountById(id);
            return Ok(result);
        }

        [HttpPost("UpdateBaseSalary")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> UpdateBaseSalary([FromBody] UpdateBaseSalaryDto dto)
        {
            var result = await _employeeFinancialService.UpdateBaseSalary(dto.AccountId, dto.BaseSalary);
            return Ok(result);
        }

        [HttpPost("AddEarnings")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> AddEarnings([FromBody] AddEarningsDto dto)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var result = await _employeeFinancialService.AddEarnings(dto, userId ?? "Unknown");
            return Ok(result);
        }

        [HttpGet("MonthlySummary/{accountId}/{year}/{month}")]
        public async Task<IActionResult> GetMonthlySummary(int accountId, int year, int month)
        {
            var result = await _employeeFinancialService.GetMonthlySummaryOrYearly(accountId, year, month);
            return Ok(result);
        }

        [HttpGet("Transactions/{accountId}")]
        [Authorize(Roles ="Admin,Accountan")]
        public async Task<IActionResult> GetTransactions(int accountId)
        {
           

            var result = await _employeeFinancialService.GetAccountTransactions(accountId);
            return Ok(result);
        }

        [HttpGet("EarningsHistory/{accountId}")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> GetEarningsHistory(int accountId)
        {
            var result = await _employeeFinancialService.GetEarningsHistory(accountId);
            return Ok(result);
        }
    }
}
