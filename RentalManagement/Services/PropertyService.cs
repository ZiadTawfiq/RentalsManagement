using RentalManagement.DTOs;
using RentalManagement.Repositories;

namespace RentalManagement.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly IPropertyRepository _propertyRepository;

        public PropertyService(IPropertyRepository propertyRepository)
        {
            _propertyRepository = propertyRepository;
        }

        public Task<ApiResponse<List<ReturnedPropertyDto>>> GetAllProperties()
            => _propertyRepository.GetAllProperties();

        public Task<ApiResponse<ReturnedPropertyDto>> GetPropertyById(int id)
            => _propertyRepository.GetPropertyById(id);

        public Task<ApiResponse<ReturnedPropertyDto>> CreateProperty(PropertyDto dto)
            => _propertyRepository.CreateProperty(dto);

        public Task<ApiResponse<ReturnedPropertyDto>> UpdateProperty(int id, PropertyDto dto)
            => _propertyRepository.UpdateProperty(id, dto);

        public Task<ApiResponse<string>> DeleteProperty(int id)
            => _propertyRepository.DeleteProperty(id);
    }
}
