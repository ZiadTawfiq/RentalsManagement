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
        [Authorize(Roles = "Admin,Accountant")]
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

        [HttpGet("MonthlySummary/{accountId}/{year}/{month}")]
        public async Task<IActionResult> GetMonthlySummary(int accountId, int year, int month)
        {
            var result = await _employeeFinancialService.GetMonthlySummary(accountId, year, month);
            return Ok(result);
        }

        [HttpGet("Transactions/{accountId}")]
        public async Task<IActionResult> GetTransactions(int accountId)
        {
            // Security: check if Admin/Accountant or the owner of the account
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdminOrAccountant = User.IsInRole("Admin") || User.IsInRole("Accountant");

            if (!isAdminOrAccountant)
            {
                var accountResult = await _employeeFinancialService.GetAccountByUserId(userId);
                if (accountResult.Data.Id != accountId) return Forbid();
            }

            var result = await _employeeFinancialService.GetAccountTransactions(accountId);
            return Ok(result);
        }
    }
}
