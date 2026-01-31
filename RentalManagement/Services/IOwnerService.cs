using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IOwnerService
    {
        Task<ApiResponse<List<ReturnedOwnerDto>>> GetAllOwners();
        Task<ApiResponse<ReturnedOwnerDto>> GetOwnerById(int id);
        Task<ApiResponse<ReturnedOwnerDto>> CreateOwner(OwnerDto dto);
        Task<ApiResponse<ReturnedOwnerDto>> UpdateOwner(int id, OwnerDto dto);
        Task<ApiResponse<string>> DeleteOwner(int id);
    }
}
