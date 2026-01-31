using RentalManagement.DTOs;
using RentalManagement.Repositories;

namespace RentalManagement.Services
{
    public class OwnerService : IOwnerService
    {
        private readonly IOwnerRepository _ownerRepository;

        public OwnerService(IOwnerRepository ownerRepository)
        {
            _ownerRepository = ownerRepository;
        }

        public Task<ApiResponse<List<ReturnedOwnerDto>>> GetAllOwners()
            => _ownerRepository.GetAllOwners();

        public Task<ApiResponse<ReturnedOwnerDto>> GetOwnerById(int id)
            => _ownerRepository.GetOwnerById(id);

        public Task<ApiResponse<ReturnedOwnerDto>> CreateOwner(OwnerDto dto)
            => _ownerRepository.CreateOwner(dto);

        public Task<ApiResponse<ReturnedOwnerDto>> UpdateOwner(int id, OwnerDto dto)
            => _ownerRepository.UpdateOwner(id, dto);

        public Task<ApiResponse<string>> DeleteOwner(int id)
            => _ownerRepository.DeleteOwner(id);
    }
}
