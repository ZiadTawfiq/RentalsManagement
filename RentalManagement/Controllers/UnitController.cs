using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Accountant,DataEntry")]

    public class OwnersController : ControllerBase
    {
        private readonly IOwnerService _ownerService;
        public class UnitController : ControllerBase
        {
            private readonly IUnitService _unitService;

            public UnitController(IUnitService unitService)
            {
                _unitService = unitService;
            }

            [HttpGet]
            public async Task<IActionResult> GetAll()
            {
                var result = await _unitService.GetAllUnits();
                if (!result.IsSuccess)
                {
                    return BadRequest(result);
                }
                return Ok(result);
            }

            [HttpGet("{id}")]
            public async Task<IActionResult> GetById(int id)
            {
                var result = await _unitService.GetUnitById(id);
                if (!result.IsSuccess)
                {
                    return BadRequest(result);
                }
                return Ok(result);
            }

            [HttpPost]
            [Route("Create")]
            public async Task<IActionResult> Create([FromBody] UnitDto dto)
            {
                var result = await _unitService.CreateUnit(dto);
                if (!result.IsSuccess)
                {
                    return BadRequest(result);
                }

                return Ok(result);
            }

            [HttpPut("{id}")]
            public async Task<IActionResult> Update(int id, UnitDto dto)
            {
                var result = await _unitService.UpdateUnit(id, dto);
                if (!result.IsSuccess)
                {
                    return BadRequest(result);
                }
                return Ok(result);
            }

            [HttpDelete("{id}")]
            public async Task<IActionResult> Delete(int id)
            {
                var result = await _unitService.DeleteUnit(id);
                if (!result.IsSuccess)
                {
                    return BadRequest(result);
                }
                return Ok(result);
            }
        }
    }
}
