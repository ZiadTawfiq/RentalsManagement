using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface ICommissionService
    {
        Task<ApiResponse<decimal>> GetCampaignCommission();
        Task<ApiResponse<CommissionReportDto>> FilterCommission(CommissionFilterDto dto);
        Task<ApiResponse<List<ReturnedCommissionSalesDto>>> GetAllSalesRepCommission();

    }
}
