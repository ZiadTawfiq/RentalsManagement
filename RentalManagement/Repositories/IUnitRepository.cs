using RentalManagement.DTOs;

namespace RentalManagement.Repositories
{
    public interface IUnitRepository
    {
        Task<ApiResponse<List<ReturnedUnitDto>>> GetAllUnits();
        Task<ApiResponse<ReturnedUnitDto>> GetUnitById(int id);
        Task<ApiResponse<ReturnedUnitDto>> CreateUnit(UnitDto dto);
        Task<ApiResponse<ReturnedUnitDto>> UpdateUnit(int id, UnitDto dto);
        Task<ApiResponse<string>> DeleteUnit(int id);
    }
}
