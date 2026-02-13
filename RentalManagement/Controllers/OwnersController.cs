using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles ="Admin,DataEntry,Accountant")]
    public class OwnerController : ControllerBase
    {
        private readonly IOwnerService _ownerService;

        public OwnerController(IOwnerService ownerService)
        {
            _ownerService = ownerService;
        }

        // GET: api/Owner
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _ownerService.GetAllOwners();
            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // GET: api/Owner/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _ownerService.GetOwnerById(id);
            if (!result.IsSuccess)
                return NotFound(result);

            return Ok(result);
        }

        // POST: api/Owner
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OwnerDto dto)
        {
            var result = await _ownerService.CreateOwner(dto);
            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // PUT: api/Owner/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] OwnerDto dto)
        {
            var result = await _ownerService.UpdateOwner(id, dto);
            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // DELETE: api/Owner/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _ownerService.DeleteOwner(id);
            if (!result.IsSuccess)
                return NotFound(result);

            return Ok(result);
        }
    }
}
