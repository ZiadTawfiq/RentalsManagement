using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;
using System.Security.Claims;

namespace RentalManagement.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExternalAccountController : ControllerBase
    {
        private readonly IExternalAccountService _service;

        public ExternalAccountController(IExternalAccountService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAccounts()
        {
            var res = await _service.GetAccounts();
            return Ok(res);
        }

        [HttpPost]
        public async Task<IActionResult> AddAccount(ExternalAccountDto dto)
        {
            var res = await _service.AddAccount(dto);
            return Ok(res);
        }

        [HttpPost("Transaction")]
        public async Task<IActionResult> AddTransaction([FromForm] ExternalTransactionDto dto, IFormFile? proofImage)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var res = await _service.AddTransaction(dto, proofImage, userId!);
            return Ok(res);
        }

        [HttpGet("History")]
        public async Task<IActionResult> GetHistory(int? accountId)
        {
            var res = await _service.GetHistory(accountId);
            return Ok(res);
        }
    }
}
