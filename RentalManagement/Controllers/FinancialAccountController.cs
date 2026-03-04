using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Entities;
using RentalManagement.Services;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Accountant")]
    public class FinancialAccountController : ControllerBase
    {
        private readonly IFinancialAccountService _financialAccountService;

        public FinancialAccountController(IFinancialAccountService financialAccountService)
        {
            _financialAccountService = financialAccountService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _financialAccountService.GetByIdAsync(id);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _financialAccountService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("name/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            var result = await _financialAccountService.GetByNameAsync(name);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] FinancialAccountDto dto)
        {

            await _financialAccountService.AddAsync(dto);

            return Ok("Account Created Successfully");
        }

        [HttpPut("update")]
        public async Task<IActionResult> Update([FromBody] UpdateFinancialAccountDto account)
        {
            var result = await _financialAccountService.UpdateAsync(account);

            return Ok(result);
        }

     
        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer(
            [FromQuery] int senderId,
            [FromQuery] int receiverId,
            [FromQuery] decimal amount,
            [FromQuery] string? comment)
        {
            var result = await _financialAccountService.Transfer(senderId, receiverId, amount, comment);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("{accountId}/deposit-external")]
        public async Task<IActionResult> DepositExternal(
            int accountId,
            [FromQuery] decimal amount,
            [FromQuery] string? comment)
        {
            var result = await _financialAccountService.DepositExternal(accountId, amount, comment);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("{accountId}/withdraw-external")]
        public async Task<IActionResult> WithdrawExternal(
            int accountId,
            [FromQuery] decimal amount,
            [FromQuery] string? comment)
        {
            var result = await _financialAccountService.WithdrawExternal(accountId, amount, comment);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>Returns all transactions for an account ordered newest-first, with full rental context.</summary>
        [HttpGet("{accountId}/transactions")]
        public async Task<IActionResult> GetTransactions(int accountId)
        {
            var result = await _financialAccountService.GetTransactionsByAccountAsync(accountId);
            return Ok(result);
        }
    }
}