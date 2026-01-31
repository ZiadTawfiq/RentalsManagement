using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;
using RentalManagement.JwtToken;

namespace RentalManagement.Services
{
    public class AutheService(UserManager<ApplicationUser> _userManager , RoleManager<IdentityRole>_roleManager,IMapper _mapper , IJwtService _jwtService , AppDbContext _context) : IAuthService
    {
        public async Task<ApiResponse<string>> ChangePassword(ChangePasswordDto dto)
        {
            var user = await _userManager.Users.Include(_=>_.RefreshTokens)
                .FirstOrDefaultAsync(_ => _.UserName == dto.UserName);
            if (user == null)
            {
                return ApiResponse<string>.Failure("Invalid UserName!");
            }
            var result = _userManager.ChangePasswordAsync(user, dto.OldPassword, dto.NewPassword);
            if (!result.IsCompletedSuccessfully)
            {
                return ApiResponse<string>.Failure("Error in Changing Password");
            }
            foreach (var token in user.RefreshTokens)
            {
                token.IsRevoked = true;
                token.RevokedOn = DateTime.UtcNow;
               
            }
            return ApiResponse<string>.Success("Password changed successfully"); 
        }

        public async Task<ApiResponse<AuthResponseDto>> Login(LoginDto dto)
        {
            var emp = await _userManager.FindByNameAsync(dto.UserName);
            if (emp == null)
            {
                return ApiResponse<AuthResponseDto>.Failure("Invalid username or password!");
            }
            var empPassword = await _userManager.CheckPasswordAsync(emp, dto.Password);
            if (!empPassword)
            {
                return ApiResponse<AuthResponseDto>.Failure("Invalid username or password!");
            }
            var roles = await _userManager.GetRolesAsync(emp);
            var accessToken = _jwtService.GenerateAccessToken(emp, roles);
            var refreshTokenEntity = _jwtService.GenerateRefreshToken(out string refreshToken);

            refreshTokenEntity.UserId = emp.Id;


            _context.RefreshTokens.Add(refreshTokenEntity);
            await _context.SaveChangesAsync(); 


            return ApiResponse<AuthResponseDto>.Success(new AuthResponseDto
            {
                AccessToken = accessToken, 
                RefreshToken = refreshToken

               
            });
            
           
        }

        public async Task<ApiResponse<ReturnedEmployeeDto>> SignUp(SignupDto dto) 
        {
          

            var userByName = await _userManager.FindByNameAsync(dto.UserName);
            if (userByName != null)
                return ApiResponse<ReturnedEmployeeDto>.Failure("UserName is already found!");
            if (dto.Password != dto.ConfirmPassword)
            {
                return ApiResponse<ReturnedEmployeeDto>.Failure("Passwords mismatch!");
            }
            var Emp = new ApplicationUser
            {
                UserName = dto.UserName,
                PropertyId = dto.PropertyId,
                CachedTotalCommission = 0

            };
          
            var result = await _userManager.CreateAsync(Emp, dto.Password);

            if (!result.Succeeded)
            {
                return ApiResponse<ReturnedEmployeeDto>.Failure(
                    string.Join(",",
                    result.Errors.Select(_ => _.Description)

                    )
                    );
            }
            foreach (string role in dto.Roles)
            {
                if (!await _roleManager.RoleExistsAsync(role))
                {
                    await _roleManager.CreateAsync(new IdentityRole(role));
                }
                var userRole = await _userManager.AddToRoleAsync(Emp, role);

                if (!userRole.Succeeded)
                {
                    return ApiResponse<ReturnedEmployeeDto>.Failure("Error in Assigning role!");
                }
            }
            var empDto = _mapper.Map<ReturnedEmployeeDto>(Emp);

            return ApiResponse<ReturnedEmployeeDto>.Success(empDto); 
            

        }

     
    }
}
