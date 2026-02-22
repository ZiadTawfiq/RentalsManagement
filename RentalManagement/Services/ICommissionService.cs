using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface ICommissionService
    {
        Task<ApiResponse<decimal>> GetCampainCommission();
        Task<ApiResponse<CommissionReportDto>> FilterCommission(CommissionFilterDto dto);
        Task<ApiResponse<List<ReturnedCommissionSalesDto>>> GetAllSalesRepCommission();

    }
}
