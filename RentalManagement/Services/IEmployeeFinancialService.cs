using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IEmployeeFinancialService
    {
        Task<ApiResponse<List<ReturnedEmployeeAccountDto>>> GetAllAccounts();
        Task<ApiResponse<ReturnedEmployeeAccountDto>> GetAccountByUserId(string userId);
        Task<ApiResponse<ReturnedEmployeeTransactionDto>> CreateTransaction(EmployeeTransactionDto dto, string performerId);
        Task<ApiResponse<ReturnedEmployeeAccountDto>> GetAccountById(int accountId);
        Task<ApiResponse<object>> GetMonthlySummaryOrYearly(int accountId, int year, int?month);
        Task<ApiResponse<bool>> UpdateBaseSalary(int accountId, decimal baseSalary);
        Task<ApiResponse<List<ReturnedEmployeeTransactionDto>>> GetAccountTransactions(int accountId);
        Task<ApiResponse<List<ReturnedEarningsHistoryDto>>> GetEarningsHistory(int accountId);
        Task<ApiResponse<bool>> AddEarnings(AddEarningsDto dto, string performerId);
        Task<ApiResponse<string>> ReceiveFromEmployee(int ToAccount, decimal amount, string employeeName);
        Task<ApiResponse<string>> TransferToEmployee(int FromAccountId, decimal amount, string employeeName);
    }
}
