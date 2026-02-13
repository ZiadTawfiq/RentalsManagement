using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.Services;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles ="Admin,Accountant")]
    public class SystemSettingController : ControllerBase
    {
        private readonly ISystemSettingService _systemSettingService;

        public SystemSettingController(ISystemSettingService systemSettingService)
        {
            _systemSettingService = systemSettingService;
        }
        [HttpPost]
        [Route("{percentage}")]
        public async Task<IActionResult> MakeCampaignPercentage([FromRoute] int percentage)
        {
            await _systemSettingService.MakeCampainPercentage(percentage);
            return Ok("Campaign percentage created successfully");
        }

        [HttpGet]
        public async Task<IActionResult> GetCampaignPercentage()
        {
            var result = await _systemSettingService.GetCompainPercentage();
            return Ok(result);
        }

        [HttpPut]
        [Route("{percentage}")]

        public async Task<IActionResult> UpdateCampaignPercentage([FromRoute] int percentage)
        {
            await _systemSettingService.UpdateCampainPercentage(percentage);
            return Ok("Campaign percentage updated successfully");
        }
    }
}
