using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommissionController(ICommissionService _commissionService):ControllerBase
    {
       
        [HttpGet]
        [Route("AllSalesRep")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCommissionForAllSalesRep()
        {
            var res = await _commissionService.GetAllSalesRepCommission();
            if (!res.IsSuccess)
            {
                return BadRequest(res);
            }
            return Ok(res);
        }
        [HttpGet]
        [Route("Campaign")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> GetCampaignCommission()
        {
            var result =
                await _commissionService.GetCampaignCommission();

            return Ok(result);
        }
        [HttpPost("filter")]
        [Authorize(Roles = "Admin,SalesRep,TeamLead")]
        public async Task<IActionResult> FilterCommission([FromBody] CommissionFilterDto dto)
        {
            var result = await _commissionService.FilterCommission(dto);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
    }
}
