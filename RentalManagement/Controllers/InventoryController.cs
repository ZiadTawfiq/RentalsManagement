using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;
using System.Security.Claims;

namespace RentalManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAssets()
        {
            var result = await _inventoryService.GetAssets();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> AddAsset([FromBody] AssetDto dto)
        {
            var result = await _inventoryService.AddAsset(dto);
            return Ok(result);
        }

        [HttpPost("ModifyQuantity")]
        public async Task<IActionResult> ModifyQuantity([FromBody] AssetQuantityChangeDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var result = await _inventoryService.ModifyQuantity(dto, userId!);
            return Ok(result);
        }

        [HttpGet("History")]
        public async Task<IActionResult> GetHistory()
        {
            var result = await _inventoryService.GetHistory();
            return Ok(result);
        }
    }
}
