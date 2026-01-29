using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Storage.Json;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Services
{
    public class AutheService(UserManager<ApplicationUser> _userManager , RoleManager<IdentityRole>_roleManager,IMapper _mapper) : IAuthService
    {
        public async Task<ApiResponse<string>> Login(LoginDto dto)
        {
            var emp = await _userManager.FindByEmailAsync(dto.Email);
            if (emp == null)
            {
                return ApiResponse<string>.Failure("Email is not Found!");
            }
            var empPassword = await _userManager.CheckPasswordAsync(emp, dto.Password);
            if (!empPassword)
            {
                return ApiResponse<string>.Failure("Password not correct!");
            }
            
            // Create JWT tokens later......

            return ApiResponse<string>.Success("Login successfully");
            
           
        }

        public async Task<ApiResponse<ReturnedEmployeeDto>> SignUp(SignupDto dto) // Confirm Password
        {
            var userByEmail = await _userManager.FindByEmailAsync(dto.Email);
            if (userByEmail != null)
                return ApiResponse<ReturnedEmployeeDto>.Failure("Email is already found!");

            var userByName = await _userManager.FindByNameAsync(dto.UserName);
            if (userByName != null)
                return ApiResponse<ReturnedEmployeeDto>.Failure("UserName is already found!");
            var Emp = new ApplicationUser
            {
                UserName = dto.UserName,
                Email = dto.Email,
                PropertyId = dto.PropertyId,
                CachedTotalCommission = 0

            };
            if (dto.Password != dto.ConfirmPassword)
            {
                return ApiResponse<ReturnedEmployeeDto>.Failure("Passwords mismatch!"); 
            }
            var result = await _userManager.CreateAsync(Emp, dto.Password);

            if (!result.Succeeded)
            {
                return ApiResponse<ReturnedEmployeeDto>.Failure(
                    string.Join(",",
                    result.Errors.Select(_ => _.Description)

                    )
                    );
            }
            if (!await _roleManager.RoleExistsAsync(dto.Role))
            {
                await _roleManager.CreateAsync(new IdentityRole(dto.Role));
            }
            var userRole = await _userManager.AddToRoleAsync(Emp, dto.Role);

            var empDto = _mapper.Map<ReturnedEmployeeDto>(Emp);

            return ApiResponse<ReturnedEmployeeDto>.Success(empDto); 
            

        }

     
    }
}
