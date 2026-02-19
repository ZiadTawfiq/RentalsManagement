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
                .Include(u => u.Property)
                .ToListAsync();

            var usersDto = new List<ReturnedEmployeeDto>();

            foreach (var user in users)
            {
                var dto = _mapper.Map<ReturnedEmployeeDto>(user);
                dto.Id = user.Id;
                var rolesList = await _userManager.GetRolesAsync(user);
                dto.Roles = rolesList.ToList();
                usersDto.Add(dto);
            }

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
        public async Task<ApiResponse<string>> UpdateRoles(string id, List<string> roles)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return ApiResponse<string>.Failure("Employee not found");

            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
                return ApiResponse<string>.Failure(string.Join(", ", removeResult.Errors.Select(e => e.Description)));

            var addResult = await _userManager.AddToRolesAsync(user, roles);
            if (!addResult.Succeeded)
                return ApiResponse<string>.Failure(string.Join(", ", addResult.Errors.Select(e => e.Description)));

            return ApiResponse<string>.Success("Roles updated successfully");
        }
    }
}
