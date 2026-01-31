using RentalManagement.DTOs;

namespace RentalManagement.Repositories
{

    public interface IPropertyRepository
    {
        Task<ApiResponse<List<ReturnedPropertyDto>>> GetAllProperties();
        Task<ApiResponse<ReturnedPropertyDto>> GetPropertyById(int id);
        Task<ApiResponse<ReturnedPropertyDto>> CreateProperty(PropertyDto dto);
        Task<ApiResponse<ReturnedPropertyDto>> UpdateProperty(int id, PropertyDto dto);
        Task<ApiResponse<string>> DeleteProperty(int id);
    }

}
