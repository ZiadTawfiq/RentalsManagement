using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IRentalService
    {
        Task <ApiResponse<ReturnedRentalDto>> CreateRental(CreateRentalDto dto);
        Task<ApiResponse<ReturnedRentalDto>> UpdateRental(UpdateRentalDto dto);

        Task<ApiResponse<decimal>> GetCampainCommission();
        Task<ApiResponse<decimal>> GetCommissionForSalesRep(string Id);
        Task<ApiResponse<List<ReturnedRentalDto>>> ViewRentalsForEmployeeById(string EmployeeId);

        Task<ApiResponse<List<ReturnedRentalDto>>> GetAllRentals();
        Task<ApiResponse<string>> DeleteRental(int Id);
        Task<ApiResponse<List<ReturnedRentalDto>>> FilterRental(RentalFilterDto Dto);

    }
}
