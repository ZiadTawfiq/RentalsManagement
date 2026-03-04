using Duende.IdentityServer.Models;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Services
{
    public interface IRentalService
    {
        Task <ApiResponse<ReturnedRentalDto>> CreateRental(CreateRentalDto dto, string UserId,string?comment);
        Task<ApiResponse<ReturnedRentalDto>> UpdateRental(UpdateRentalDto dto,string UserId);

        Task<ApiResponse<List<ReturnedRentalDto>>> ViewRentalsForEmployeeById(string EmployeeId);
        Task<ApiResponse<List<ReturnedRentalDto>>> GetAllRentals();
        Task<ApiResponse<string>> DeleteRental(int Id);
        Task<ApiResponse<List<ReturnedRentalDto>>> FilterRental(RentalFilterDto Dto);
        Task<ApiResponse<ReturnedRentalNoteDto>> AddRentalNote(int rentalId, string content, string? employeeId);
        Task<ApiResponse<string>> CancelRental(int rentalId, RentalStatus rentaStatus, string? cancellationReason);
        Task<ApiResponse<bool>> CompleteRental(int rentalId);
        Task<ApiResponse<string>> AddSecurityDeposit(int rentalId, AddSecurityDepositDto dto);
        Task<ApiResponse<string>> RefundSecurityDeposit(int rentalId, RefundSecurityDepositDto dto);
        Task<ApiResponse<string>> PayRentRemainingCustomer(int rentalId, PayRentDto dto,string?comment);
        Task<ApiResponse<string>> PayRentRemainingOwner(int rentalId, PayRentDto dto,string?comment);


    }
}
