using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public class OwnerRepository : IOwnerRepository
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public OwnerRepository(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        private string NormalizePhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return phone;

            phone = phone.Trim()
                         .Replace(" ", "")
                         .Replace("-", "")
                         .Replace("(", "")
                         .Replace(")", "")
                         .Replace("_", "");

            if (phone.StartsWith("+02"))
                phone = "+20" + phone.Substring(3);

            if (phone.StartsWith("0"))
                phone = "+20" + phone.Substring(1);

            return phone;
        }

        public async Task<ApiResponse<List<ReturnedOwnerDto>>> GetAllOwners()
        {
            var owners = await _context.Owners.ToListAsync();
            return ApiResponse<List<ReturnedOwnerDto>>
                .Success(_mapper.Map<List<ReturnedOwnerDto>>(owners));
        }

        public async Task<ApiResponse<ReturnedOwnerDto>> GetOwnerById(int id)
        {
            var owner = await _context.Owners.FindAsync(id);
            if (owner == null)
                return ApiResponse<ReturnedOwnerDto>.Failure("Owner not found");

            return ApiResponse<ReturnedOwnerDto>
                .Success(_mapper.Map<ReturnedOwnerDto>(owner));
        }

        public async Task<ApiResponse<ReturnedOwnerDto>> CreateOwner(OwnerDto dto)
        {
            var ownerExist = await _context.Owners.AnyAsync(_ => _.PhoneNumber == dto.PhoneNumber);
            if (ownerExist)
            {
                return ApiResponse<ReturnedOwnerDto>.Failure("PhoneNumber is already Exist!");
            }
            dto.PhoneNumber = NormalizePhone(dto.PhoneNumber);
            var owner = _mapper.Map<Owner>(dto);
            _context.Owners.Add(owner);
            await _context.SaveChangesAsync();

            return ApiResponse<ReturnedOwnerDto>
                .Success(_mapper.Map<ReturnedOwnerDto>(owner));
        }

        public async Task<ApiResponse<ReturnedOwnerDto>> UpdateOwner(int id, OwnerDto dto)
        {
            dto.PhoneNumber = NormalizePhone(dto.PhoneNumber);

            var owner = await _context.Owners.FindAsync(id);
            if (owner == null)
                return ApiResponse<ReturnedOwnerDto>.Failure("Owner not found");

            _mapper.Map(dto, owner);
            await _context.SaveChangesAsync();

            return ApiResponse<ReturnedOwnerDto>
                .Success(_mapper.Map<ReturnedOwnerDto>(owner));
        }

        public async Task<ApiResponse<string>> DeleteOwner(int id)
        {
            var owner = await _context.Owners.FindAsync(id);
            if (owner == null)
                return ApiResponse<string>.Failure("Owner not found");

            _context.Owners.Remove(owner);
            await _context.SaveChangesAsync();

            return ApiResponse<string>.Success("Owner deleted successfully");
        }
    }


}
