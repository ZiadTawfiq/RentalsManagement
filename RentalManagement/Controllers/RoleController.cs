using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace RentalManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class RoleController : ControllerBase
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public RoleController(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var roles = _roleManager.Roles.Select(r => new { r.Id, r.Name }).ToList();
            return Ok(new { isSuccess = true, data = roles });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] string roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
                return BadRequest(new { isSuccess = false, message = "Role name is required" });

            if (await _roleManager.RoleExistsAsync(roleName))
                return BadRequest(new { isSuccess = false, message = $"Role '{roleName}' already exists" });

            var result = await _roleManager.CreateAsync(new IdentityRole(roleName));
            if (!result.Succeeded)
                return BadRequest(new { isSuccess = false, message = string.Join(", ", result.Errors.Select(e => e.Description)) });

            return Ok(new { isSuccess = true, message = $"Role '{roleName}' created successfully" });
        }

        [HttpDelete("{roleName}")]
        public async Task<IActionResult> Delete(string roleName)
        {
            var role = await _roleManager.FindByNameAsync(roleName);
            if (role == null)
                return BadRequest(new { isSuccess = false, message = "Role not found" });

            var result = await _roleManager.DeleteAsync(role);
            if (!result.Succeeded)
                return BadRequest(new { isSuccess = false, message = string.Join(", ", result.Errors.Select(e => e.Description)) });

            return Ok(new { isSuccess = true, message = $"Role '{roleName}' deleted successfully" });
        }
    }
}
