using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IEmployeeFinancialService
    {
        Task<ApiResponse<List<ReturnedEmployeeAccountDto>>> GetAllAccounts();
        Task<ApiResponse<ReturnedEmployeeAccountDto>> GetAccountByUserId(string userId);
        Task<ApiResponse<ReturnedEmployeeTransactionDto>> CreateTransaction(EmployeeTransactionDto dto, string performerId);
        Task<ApiResponse<ReturnedEmployeeAccountDto>> GetAccountById(int accountId);
        Task<ApiResponse<object>> GetMonthlySummary(int accountId, int year, int month);
        Task<ApiResponse<bool>> UpdateBaseSalary(int accountId, decimal baseSalary);
        Task<ApiResponse<List<ReturnedEmployeeTransactionDto>>> GetAccountTransactions(int accountId);
    }
}
