using RentalManagement.DTOs;
using RentalManagement.Repositories;

namespace RentalManagement.Services
{
    public class UnitService : IUnitService
    {
        private readonly IUnitRepository _unitRepository;

        public UnitService(IUnitRepository unitRepository)
        {
            _unitRepository = unitRepository;
        }

        public Task<ApiResponse<List<ReturnedUnitDto>>> GetAllUnits()
            => _unitRepository.GetAllUnits();

        public Task<ApiResponse<ReturnedUnitDto>> GetUnitById(int id)
            => _unitRepository.GetUnitById(id);

        public Task<ApiResponse<ReturnedUnitDto>> CreateUnit(UnitDto dto)
            => _unitRepository.CreateUnit(dto);

        public Task<ApiResponse<ReturnedUnitDto>> UpdateUnit(int id, UnitDto dto)
            => _unitRepository.UpdateUnit(id, dto);

        public Task<ApiResponse<string>> DeleteUnit(int id)
            => _unitRepository.DeleteUnit(id);
    }

}
