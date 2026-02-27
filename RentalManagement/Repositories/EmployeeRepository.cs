using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using RentalManagement.DTOs;
using RentalManagement.Entities;
using RentalManagement.Services;

namespace RentalManagement.Repositories
{
    public class EmployeeRepository(UserManager<ApplicationUser>_userManager,AppDbContext _context , IMapper _mapper, ICacheService _cacheService) : IEmployeeRepository
    {
      

        public async Task<ApiResponse<string>> DeleteEmployee(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<string>.Failure("Employee not found");
            }
            if (await _userManager.IsInRoleAsync(user , "Admin"))
            {
                var adminCount = await _userManager.GetUsersInRoleAsync("Admin"); 
                if (adminCount.Count <= 1)
                {
                    return ApiResponse<string>.Failure("Delete Admin Not Allowed");
                }
            }

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                return ApiResponse<string>.Failure(
                    string.Join(", ", result.Errors.Select(e => e.Description))
                );
            }
            _cacheService.Remove($"{CacheKeys.Employee}_{id}"); 
            _cacheService.Remove(CacheKeys.AllEmployees); 
            return ApiResponse<string>.Success("Employee deleted successfully");
        }

        public async Task<ApiResponse<List<ReturnedEmployeeDto>>> GetAllEmployees()
        {

            var employeesList = await _cacheService.GetOrSet(CacheKeys.AllEmployees, async () =>
            {
             

                var userWithRoles = await (
                from user in _context.Users
                join userRole in _context.UserRoles
                      on user.Id equals userRole.UserId
                join role in _context.Roles
                      on userRole.RoleId equals role.Id
                group role by user into g
                select new ReturnedEmployeeDto
                {
                    Id = g.Key.Id,
                    UserName = g.Key.UserName ?? "N/A", 
                    Roles = g.Select( _ => _.Name).ToList(),
                    PropertyId = g.Key.PropertyId ?? 0,
                    PhoneNumber = g.Key.PhoneNumber?? "N/A"
                    
                }).ToListAsync();

                return userWithRoles; 
               

      
            } ,TimeSpan.FromHours(6));
            return ApiResponse<List<ReturnedEmployeeDto>>.Success(employeesList); 
           

          
        }

        public async Task<ApiResponse<ReturnedEmployeeDto>> GetEmployeeById(string id)
        {
            var cacheKey = $"{CacheKeys.Employee}_{id}";
            var Employee = await _cacheService.GetOrSet(cacheKey, async () =>
            {
                var user = await _userManager.FindByIdAsync(id);
                if (user == null)
                    return null; 


                var userDto = _mapper.Map<ReturnedEmployeeDto>(user);
                return userDto;
            }, TimeSpan.FromHours(6)); 
            if (Employee == null)
            {
                return ApiResponse<ReturnedEmployeeDto>.Failure("Employee Not Found!");
            }

            return ApiResponse<ReturnedEmployeeDto>.Success(Employee); 


        }

        public async Task<ApiResponse<ReturnedEmployeeDto>> UpdateEmployee(string id, UpdateEmployeeDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<ReturnedEmployeeDto>.Failure("Employee not found");
            }

            _mapper.Map(dto, user); //  update the values of old user with values in dto (EF Tracking) 

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                return ApiResponse<ReturnedEmployeeDto>.Failure(
                    string.Join(", ", result.Errors.Select(e => e.Description))
                );
            }
            if (dto.Roles != null && dto.Roles.Any())
            {
                var currentRoles = await _userManager.GetRolesAsync(user);

                // Remove old roles
                var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
                if (!removeResult.Succeeded)
                {
                    return ApiResponse<ReturnedEmployeeDto>.Failure(
                        string.Join(", ", removeResult.Errors.Select(e => e.Description))
                    );
                }

                // Add new roles
                var addResult = await _userManager.AddToRolesAsync(user, dto.Roles);
                if (!addResult.Succeeded)
                {
                    return ApiResponse<ReturnedEmployeeDto>.Failure(
                        string.Join(", ", addResult.Errors.Select(e => e.Description))
                    );
                }
            }
            var userDto = _mapper.Map<ReturnedEmployeeDto>(user);

            _cacheService.Remove($"{CacheKeys.Employee}_{id}");
            _cacheService.Remove(CacheKeys.AllEmployees);
            return ApiResponse<ReturnedEmployeeDto>.Success(userDto);



        }
        public async Task<ApiResponse<string>> UpdateRoles(string id, List<string> roles)
        {
            if (roles == null)
            {
                return ApiResponse<string>.Failure("Roles can not be null!"); 
            }
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return ApiResponse<string>.Failure("Employee not found");

            var currentRoles = await _userManager.GetRolesAsync(user);

            var rolesToRemoved = currentRoles.Except(roles).ToList();
            var rolesToAdded = roles.Except(currentRoles).ToList();

            if (rolesToRemoved.Any())
            {
                var removeResult = await _userManager.RemoveFromRolesAsync(user, rolesToRemoved);

                if (!removeResult.Succeeded)
                    return ApiResponse<string>.Failure(string.Join(", ", removeResult.Errors.Select(e => e.Description)));
            }
            if (rolesToAdded.Any())
            {
                var addResult = await _userManager.AddToRolesAsync(user, rolesToAdded);
                if (!addResult.Succeeded)
                    return ApiResponse<string>.Failure(string.Join(", ", addResult.Errors.Select(e => e.Description)));
            }
            _cacheService.Remove($"{CacheKeys.Employee}_{id}");
            _cacheService.Remove(CacheKeys.AllEmployees); 
            
            return ApiResponse<string>.Success("Roles updated successfully");
        }
    }
}
