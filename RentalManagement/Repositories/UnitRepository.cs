using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public class UnitRepository : IUnitRepository
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public UnitRepository(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<List<ReturnedUnitDto>>> GetAllUnits()
        {
            var units = await _context.Units
                .Include(u => u.Owner)
                .Include(u => u.Property)
                .ToListAsync();

            return ApiResponse<List<ReturnedUnitDto>>
                .Success(_mapper.Map<List<ReturnedUnitDto>>(units));
        }

        public async Task<ApiResponse<ReturnedUnitDto>> GetUnitById(int id)
        {
            var unit = await _context.Units
                .Include(u => u.Owner)
                .Include(u => u.Property)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (unit == null)
                return ApiResponse<ReturnedUnitDto>.Failure("Unit not found");

            return ApiResponse<ReturnedUnitDto>
                .Success(_mapper.Map<ReturnedUnitDto>(unit));
        }

        public async Task<ApiResponse<ReturnedUnitDto>> CreateUnit(UnitDto dto)
        {
            var unitExist = await _context.Units.AnyAsync(_ => _.Code == dto.Code);
            if (unitExist)
            {
                return ApiResponse<ReturnedUnitDto>.Failure("Unit Code is already Exist!");

            }
            var unit = _mapper.Map<Unit>(dto);
            _context.Units.Add(unit);
            await _context.SaveChangesAsync();

            await _context.Entry(unit).Reference(u => u.Owner).LoadAsync();
            await _context.Entry(unit).Reference(u => u.Property).LoadAsync();

            return ApiResponse<ReturnedUnitDto>
                .Success(_mapper.Map<ReturnedUnitDto>(unit));
        }

        public async Task<ApiResponse<ReturnedUnitDto>> UpdateUnit(int id, UnitDto dto)
        {
            var unit = await _context.Units.FindAsync(id);
            if (unit == null)
                return ApiResponse<ReturnedUnitDto>.Failure("Unit not found");

            _mapper.Map(dto, unit);
            await _context.SaveChangesAsync();

            await _context.Entry(unit).Reference(u => u.Owner).LoadAsync();
            await _context.Entry(unit).Reference(u => u.Property).LoadAsync();

            return ApiResponse<ReturnedUnitDto>
                .Success(_mapper.Map<ReturnedUnitDto>(unit));
        }

        public async Task<ApiResponse<string>> DeleteUnit(int id)
        {
            var unit = await _context.Units
                .Include(u => u.Rentals)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (unit == null)
                return ApiResponse<string>.Failure("Unit not found");

            if (unit.Rentals.Any())
                return ApiResponse<string>.Failure("Cannot delete unit with rentals");

            _context.Units.Remove(unit);
            await _context.SaveChangesAsync();

            return ApiResponse<string>.Success("Unit deleted successfully");
        }
    }

}
