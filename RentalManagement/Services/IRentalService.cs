using Duende.IdentityServer.Models;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Services
{
    public interface IRentalService
    {
        Task <ApiResponse<ReturnedRentalDto>> CreateRental(CreateRentalDto dto, string UserId);
        Task<ApiResponse<ReturnedRentalDto>> UpdateRental(UpdateRentalDto dto,string UserId);

        Task<ApiResponse<decimal>> GetCampainCommission();
        Task<ApiResponse<decimal>> GetCommissionForSalesRep(string Id);
        Task<ApiResponse<List<ReturnedRentalDto>>> ViewRentalsForEmployeeById(string EmployeeId);

        Task<ApiResponse<List<ReturnedRentalDto>>> GetAllRentals();
        Task<ApiResponse<string>> DeleteRental(int Id);
        Task<ApiResponse<List<ReturnedRentalDto>>> FilterRental(RentalFilterDto Dto);
        Task<ApiResponse<ReturnedRentalNoteDto>> AddRentalNote(int rentalId, string content, string? employeeId);
        Task<ApiResponse<List<ReturnedCommissionSalesDto>>> GetAllSalesRepCommission();
        Task<ApiResponse<string>> CancelRental(int rentalId, RentalStatus rentaStatus);
    }
}
