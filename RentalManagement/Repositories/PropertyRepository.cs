using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public class PropertyRepository : IPropertyRepository
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public PropertyRepository(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<List<ReturnedPropertyDto>>> GetAllProperties()
        {
            var properties = await _context.Properties.ToListAsync();
            return ApiResponse<List<ReturnedPropertyDto>>
                .Success(_mapper.Map<List<ReturnedPropertyDto>>(properties));
        }

        public async Task<ApiResponse<ReturnedPropertyDto>> GetPropertyById(int id)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null)
                return ApiResponse<ReturnedPropertyDto>.Failure("Property not found");

            return ApiResponse<ReturnedPropertyDto>
                .Success(_mapper.Map<ReturnedPropertyDto>(property));
        }

        public async Task<ApiResponse<ReturnedPropertyDto>> CreateProperty(PropertyDto dto)
        {
            try 
            {
                var propertyExist = await _context.Properties.AsNoTracking().AnyAsync(_ =>_.Name == dto.Name);
                if (propertyExist)
                {
                    return ApiResponse<ReturnedPropertyDto>.Failure("Property name already exists!");
                }
                var property = _mapper.Map<Property>(dto);
                _context.Properties.Add(property);
                await _context.SaveChangesAsync();

                return ApiResponse<ReturnedPropertyDto>
                    .Success(_mapper.Map<ReturnedPropertyDto>(property));
            }
            catch (Exception ex)
            {
                return ApiResponse<ReturnedPropertyDto>.Failure($"Internal Server Error: {ex.Message} {ex.InnerException?.Message}");
            }
        }

        public async Task<ApiResponse<ReturnedPropertyDto>> UpdateProperty(int id, PropertyDto dto)
        {
            var property = await _context.Properties.FindAsync(id);
            if (property == null)
                return ApiResponse<ReturnedPropertyDto>.Failure("Property not found");

            _mapper.Map(dto, property);
            await _context.SaveChangesAsync();

            return ApiResponse<ReturnedPropertyDto>
                .Success(_mapper.Map<ReturnedPropertyDto>(property));
        }

        public async Task<ApiResponse<string>> DeleteProperty(int id)
        {
            try
            {
                var property = await _context.Properties
                    .Include(p => p.Units)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (property == null)
                    return ApiResponse<string>.Failure("Property not found");

                if (property.Units.Any())
                    return ApiResponse<string>.Failure("Cannot delete property because it has registered units. Please delete the units first.");

                // Check for rentals as well
                var hasRentals = await _context.Rentals.AnyAsync(r => r.PropertyId == id);
                if (hasRentals)
                    return ApiResponse<string>.Failure("This property is linked to active or past rentals. To maintain data integrity, it cannot be deleted while rentals exist.");

                // Check for users (employees) assigned to this property
                var hasUsers = await _context.Users.AnyAsync(u => u.PropertyId == id);
                if (hasUsers)
                    return ApiResponse<string>.Failure("There are employees assigned to this property. Please reassign them to a different property before deletion.");

                _context.Properties.Remove(property);
                await _context.SaveChangesAsync();

                return ApiResponse<string>.Success("Property deleted successfully");
            }
            catch (DbUpdateException)
            {
                return ApiResponse<string>.Failure("Unable to delete this property because it's being used by other parts of the system (like system logs or historical records).");
            }
            catch (Exception ex)
            {
                return ApiResponse<string>.Failure($"Error deleting property: {ex.Message}");
            }
        }
    }

}
