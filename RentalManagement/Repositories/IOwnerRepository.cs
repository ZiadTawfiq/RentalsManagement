using RentalManagement.DTOs;

namespace RentalManagement.Repositories
{
    public interface IOwnerRepository
    {
        Task<ApiResponse<List<ReturnedOwnerDto>>> GetAllOwners();
        Task<ApiResponse<ReturnedOwnerDto>> GetOwnerById(int id);
        Task<ApiResponse<ReturnedOwnerDto>> CreateOwner(OwnerDto dto);
        Task<ApiResponse<ReturnedOwnerDto>> UpdateOwner(int id, OwnerDto dto);
        Task<ApiResponse<string>> DeleteOwner(int id);
    }

}
