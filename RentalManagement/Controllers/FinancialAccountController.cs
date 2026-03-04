    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Mvc;
    using RentalManagement.Entities;
    using RentalManagement.Services;

    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Accountant")]
    public class FinancialAccountController : ControllerBase
    {
        private readonly IFinancialAccountService _service;

        public FinancialAccountController(IFinancialAccountService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpPost("{id}/deposit")]
        public async Task<IActionResult> Deposit(
            int id,
            [FromQuery] decimal amount,
            [FromQuery] string? comment,
            [FromQuery] TransactionType type)
        {
            var result = await _service.Deposit(id, amount, comment, type);
            return Ok(result);
        }

        [HttpPost("{id}/withdraw")]
        public async Task<IActionResult> Withdraw(
            int id,
            [FromQuery] decimal amount,
            [FromQuery] string? comment,
            [FromQuery] TransactionType type)
        {
            var result = await _service.Withdraw(id, amount, comment, type);
            return Ok(result);
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer(
            [FromQuery] int senderId,
            [FromQuery] int receiverId,
            [FromQuery] decimal amount,
            [FromQuery] string? comment)
        {
            var result = await _service.Transfer(senderId, receiverId, amount, comment);
            return Ok(result);
        }
    // ==================== External Deposit ====================

    [HttpPost("{accountId}/deposit-external")]
    public async Task<IActionResult> DepositExternal(
        [FromRoute] int accountId,
        [FromQuery] decimal amount,
        [FromQuery] string? comment)
    {
        var result = await _service.DepositExternal(accountId, amount, comment);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }


    // ==================== External Withdraw ====================

    [HttpPost("{accountId}/withdraw-external")]
    public async Task<IActionResult> WithdrawExternal(
        [FromRoute] int accountId,
        [FromQuery] decimal amount,
        [FromQuery] string? comment)
    {
        var result = await _service.WithdrawExternal(accountId, amount, comment);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }
}