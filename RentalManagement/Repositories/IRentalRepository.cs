using RentalManagement.DTOs;

namespace RentalManagement.Repositories
{
    public interface IRentalRepository
    {
        Task<ApiResponse<List<ReturnedRentalDto>>> ViewRentalsForEmployeeById(string EmployeeId);

        Task<ApiResponse<List<ReturnedRentalDto>>> GetAllRentals();

        Task<ApiResponse<string>> DeleteRental(int Id);

        Task<ApiResponse<ReturnedRentalDto>> FilterRental(int? PropertyId, int? OwnerId, int? unitId, string? SalesRepId); 
    }
}
