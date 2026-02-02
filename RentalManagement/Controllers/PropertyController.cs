using Microsoft.AspNetCore.Mvc;
using RentalManagement.DTOs;
using RentalManagement.Services;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PropertyController : ControllerBase
    {
        private readonly IPropertyService _propertyService;

        public PropertyController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _propertyService.GetAllProperties();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _propertyService.GetPropertyById(id);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(PropertyDto dto)
        {
            var result = await _propertyService.CreateProperty(dto);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PropertyDto dto)
        {
            var result = await _propertyService.UpdateProperty(id, dto);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _propertyService.DeleteProperty(id);
            return Ok(result);
        }
    }
}
