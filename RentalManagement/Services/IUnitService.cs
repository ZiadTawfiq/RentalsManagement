using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IUnitService
    {
        Task<ApiResponse<List<ReturnedUnitDto>>> GetAllUnits();
        Task<ApiResponse<ReturnedUnitDto>> GetUnitById(int id);
        Task<ApiResponse<ReturnedUnitDto>> CreateUnit(UnitDto dto);
        Task<ApiResponse<ReturnedUnitDto>> UpdateUnit(int id, UnitDto dto);
        Task<ApiResponse<string>> DeleteUnit(int id);
    }

}
