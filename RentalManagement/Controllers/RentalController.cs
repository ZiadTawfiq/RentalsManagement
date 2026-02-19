using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;
using System.Security.Claims;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RentalController : ControllerBase
    {
        private readonly IRentalService _rentalService;

        public RentalController(IRentalService rentalService)
        {
            _rentalService = rentalService;
        }

       
        [HttpPost("create")]
        [Authorize(Roles = "Admin,DataEntry,Accountant")]
        public async Task<IActionResult> CreateRental([FromBody] CreateRentalDto dto)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "System"; 
            var result = await _rentalService.CreateRental(dto , userId);
            return Ok(result);
        }

    
        [HttpPut("update")]
        [Authorize(Roles = "Admin,DataEntry,Accountant")]

        public async Task<IActionResult> UpdateRental([FromBody] UpdateRentalDto dto)
        {
            string UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "System";
            var result = await _rentalService.UpdateRental(dto,UserId);
            return Ok(result);
        }

       
        [HttpGet]
        [Authorize(Roles = "Admin,Accountant")]

        public async Task<IActionResult> GetAllRentals()
        {
            var result = await _rentalService.GetAllRentals();
            return Ok(result);
        }

        [HttpGet("employee/{employeeId}")]
        [Authorize(Roles = "Admin,Accountant,SalesRep")]

        public async Task<IActionResult> GetRentalsForEmployee(string employeeId)
        {
            var result =
                await _rentalService.ViewRentalsForEmployeeById(employeeId);

            return Ok(result);
        }

        
        [HttpGet("commission/campaign")]
        [Authorize(Roles = "Admin,Accountant")]

        public async Task<IActionResult> GetCampaignCommission()
        {
            var result =
                await _rentalService.GetCampainCommission();

            return Ok(result);
        }

        [HttpGet("commission/sales/{salesRepId}")]
        [Authorize(Roles = "Admin,Accountant,SalesRep")]

        public async Task<IActionResult> GetCommissionForSalesRep(string salesRepId)
        {
            var result =
                await _rentalService.GetCommissionForSalesRep(salesRepId);

            return Ok(result);
        }
        [HttpDelete]
        [Route("{Id}")]
        [Authorize(Roles = "Admin,Accountant")]

        public async Task<IActionResult>DeleteRental([FromRoute]int Id)
        {
            var res = await _rentalService.DeleteRental(Id);
            return Ok(res); 
        }
        [HttpGet]
        [Route("Filter")]
        [Authorize(Roles = "Admin,Accountant")]

        public async Task<IActionResult> Filter([FromQuery] RentalFilterDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();

            if (User.IsInRole("SalesRep"))
             dto.SalesRepId = userId;
        
           

            var res = await _rentalService.FilterRental(dto);
            return Ok(res); 
        }
        [HttpPost("{rentalId}/notes")]
        [Authorize(Roles = "Admin,Accountant,DataEntry,SalesRep")]
        public async Task<IActionResult> AddNote(int rentalId, [FromBody] AddNoteDto dto)
        {
            var employeeId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _rentalService.AddRentalNote(rentalId, dto.Content, employeeId);
            return Ok(result);
        }
        [HttpGet]
        [Route("CommissionAllSalesRep")]
        public async Task<IActionResult> GetCommissionForAllSalesRep()
        {
            var res = await _rentalService.GetAllSalesRepCommission(); 
            if (!res.IsSuccess)
            {
                return BadRequest(res); 
            }
            return Ok(res);
        }
    }
}
