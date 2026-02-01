using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public class EmployeeRepository(UserManager<ApplicationUser>_userManager , IMapper _mapper) : IEmployeeRepository
    {
      

        public async Task<ApiResponse<string>> DeleteEmployee(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return ApiResponse<string>.Failure("Employee not found");
            }

            var result = await _userManager.DeleteAsync(user);

            if (!result.Succeeded)
            {
                return ApiResponse<string>.Failure(
                    string.Join(", ", result.Errors.Select(e => e.Description))
                );
            }

            return ApiResponse<string>.Success("Employee deleted successfully");
        }

        public async Task<ApiResponse<List<ReturnedEmployeeDto>>> GetAllEmployees()
        {
            var users = await _userManager.Users
                .Where(_ => _.PropertyId != null)
                .ToListAsync();
            if (users == null)
            {
                return ApiResponse <List< ReturnedEmployeeDto>>.Failure("Employee not found");

            }
            var usersDto = _mapper.Map<List<ReturnedEmployeeDto>>(users);

            return ApiResponse<List<ReturnedEmployeeDto>>.Success(usersDto); 
           
        }

        public async Task<ApiResponse<ReturnedEmployeeDto>> GetEmployeeById(string id)
        {

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            return ApiResponse<ReturnedEmployeeDto>.Failure("Employee not found");


            var userDto = _mapper.Map<ReturnedEmployeeDto>(user);

            return ApiResponse<ReturnedEmployeeDto>.Success(userDto);

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

            return ApiResponse<ReturnedEmployeeDto>.Success(userDto);



        }
    }
}
