using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentalManagement.Entities;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CampainController(AppDbContext context) : ControllerBase
    {
        // GET /api/Campain — list all campaign types
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var campains = await context.Campains
                .Select(c => new { c.Id, c.Type })
                .ToListAsync();
            return Ok(ApiResponse<object>.Success(campains));
        }

        // GET /api/Campain/stats — each campaign with rental count
        [HttpGet("stats")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await context.Campains
                .Select(c => new
                {
                    c.Id,
                    c.Type,
                    RentalCount = context.Rentals.Count(r => r.campainId == c.Id),
                })
                .ToListAsync();
            return Ok(ApiResponse<object>.Success(stats));
        }

        // POST /api/Campain — create new campaign type
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateCampainDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Type))
                return BadRequest(ApiResponse<string>.Failure("Campaign type is required."));

            var exists = await context.Campains.AnyAsync(c => c.Type == dto.Type.Trim());
            if (exists)
                return BadRequest(ApiResponse<string>.Failure($"Campaign '{dto.Type}' already exists."));

            var campain = new Campain { Type = dto.Type.Trim() };
            context.Campains.Add(campain);
            await context.SaveChangesAsync();
            return Ok(ApiResponse<object>.Success(new { campain.Id, campain.Type }));
        }

        // DELETE /api/Campain/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var campain = await context.Campains.FindAsync(id);
            if (campain == null)
                return NotFound(ApiResponse<string>.Failure("Campaign not found."));

            context.Campains.Remove(campain);
            await context.SaveChangesAsync();
            return Ok(ApiResponse<string>.Success("Deleted"));
        }

        // GET /api/Campain/{id}/rentals — rentals for a specific campaign channel
        [HttpGet("{id}/rentals")]
        [Authorize(Roles = "Admin,Accountant")]
        public async Task<IActionResult> GetRentals(int id)
        {
            var rentals = await context.Rentals
                .Where(r => r.campainId == id)
                .Include(r => r.Unit)
                .Include(r => r.RentalSettlement)
                .Include(r => r.RentalSales)
                    .ThenInclude(rs => rs.SalesRepresentative)
                .Select(r => new
                {
                    r.Id,
                    UnitCode = r.Unit != null ? r.Unit.Code : "",
                    r.CustomerFullName,
                    r.CustomerPhoneNumber,
                    StartDate = r.StartDate.ToString(),
                    EndDate = r.EndDate.ToString(),
                    Status = r.status.ToString(),
                    CampainMoney = r.RentalSettlement != null ? r.RentalSettlement.CampainMoney : 0,
                    Sales = r.RentalSales.Select(rs => new
                    {
                        SalesRepName = rs.SalesRepresentative != null ? rs.SalesRepresentative.UserName : "",
                        rs.CommissionPercentage,
                        rs.CommissionAmount
                    }).ToList()
                })
                .ToListAsync();

            return Ok(ApiResponse<object>.Success(rentals));
        }
    }

    public class CreateCampainDto
    {
        public string Type { get; set; } = "";
    }
}
