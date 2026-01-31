using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IPropertyService
    {
        Task<ApiResponse<List<ReturnedPropertyDto>>> GetAllProperties();
        Task<ApiResponse<ReturnedPropertyDto>> GetPropertyById(int id);
        Task<ApiResponse<ReturnedPropertyDto>> CreateProperty(PropertyDto dto);
        Task<ApiResponse<ReturnedPropertyDto>> UpdateProperty(int id, PropertyDto dto);
        Task<ApiResponse<string>> DeleteProperty(int id);
    }
}
