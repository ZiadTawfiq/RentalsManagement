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
            var result = await _rentalService.CreateRental(dto);
            return Ok(result);
        }

    
        [HttpPut("update")]
        [Authorize(Roles = "Admin,DataEntry,Accountant")]

        public async Task<IActionResult> UpdateRental([FromBody] UpdateRentalDto dto)
        {
            var result = await _rentalService.UpdateRental(dto);
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

        public async Task<IActionResult> Filter([FromBody] RentalFilterDto dto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userId == null)
                return Unauthorized();

            if (User.IsInRole("SalesRep"))
             dto.SalesRepId = userId;
        
           

            var res = await _rentalService.FilterRental(dto);
            return Ok(res); 
        }
     

    }
}
