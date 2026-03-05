using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Entities;
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

       
        [HttpPost]
        [Route("create")]
        [Authorize(Roles = "Admin,DataEntry")]
        public async Task<IActionResult> CreateRental([FromBody] CreateRentalDto dto,[FromQuery]string? comment)
        {
            string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "System"; 
            var result = await _rentalService.CreateRental(dto , userId,comment);
            return Ok(result);
        }

    
        [HttpPut("update")]
        [Authorize(Roles = "Admin,DataEntry")]

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
        [HttpPost("{rentalId}/notes")]
        [Authorize(Roles = "Admin,Accountant,DataEntry")]
        public async Task<IActionResult> AddNote(int rentalId, [FromBody] AddNoteDto dto)
        {
            var employeeId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var result = await _rentalService.AddRentalNote(rentalId, dto.Content, employeeId);
            return Ok(result);
        }
        [HttpPut("{rentalId}/complete")]
        [Authorize(Roles ="Accountant,Admin,Operation")]
        public async Task<IActionResult> CompleteRental([FromRoute]int rentalId)
        {
            var result = await _rentalService.CompleteRental(rentalId);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
        [HttpPut("{rentalId}/Cancel")]
        [Authorize(Roles = "Accountant,Admin")]
        public async Task<IActionResult> CancelRental([FromRoute] int rentalId,[FromBody]CancelRentalDto dto)
        {
            var result = await _rentalService.CancelRental(rentalId, dto.Status, dto.CancellationReason);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
        // ==================== Security Deposit ====================

        [HttpPost("{rentalId}/security-deposit/add")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> AddSecurityDeposit(
            [FromRoute] int rentalId,
            [FromBody] AddSecurityDepositDto dto)
        {
            var result = await _rentalService.AddSecurityDeposit(rentalId, dto);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }


        [HttpPost("{rentalId}/security-deposit/refund")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> RefundSecurityDeposit(
            [FromRoute] int rentalId,
            [FromBody] RefundSecurityDepositDto dto)
        {
            var result = await _rentalService.RefundSecurityDeposit(rentalId, dto);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }



        // ==================== Pay Remaining ====================

        [HttpPost("{rentalId}/pay/customer")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> PayRentRemainingCustomer(
            [FromRoute] int rentalId,
            [FromBody] PayRentDto dto,
            [FromQuery] string? comment)
        {
            var result = await _rentalService
                .PayRentRemainingCustomer(rentalId, dto, comment);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }


        [HttpPost("{rentalId}/pay/owner")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> PayRentRemainingOwner(
            [FromRoute] int rentalId,
            [FromBody] PayRentDto dto,
            [FromQuery] string? comment)
        {
            var result = await _rentalService
                .PayRentRemainingOwner(rentalId, dto, comment);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

    }
}
