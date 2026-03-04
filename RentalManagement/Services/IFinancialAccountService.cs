using RentalManagement.DTOs;
using RentalManagement.Entities;
using RentalManagement.Repositories;

namespace RentalManagement.Services
{
    public interface IFinancialAccountService 
    {
        Task<ApiResponse<FinancialAccountDto>?> GetByIdAsync(int id);
        Task<ApiResponse<List<FinancialAccountDto>>> GetAllAsync();
        Task AddAsync(FinancialAccountDto dto);
        Task<ApiResponse<string>> UpdateAsync(UpdateFinancialAccountDto dto);
       
        Task<ApiResponse<string>>Transfer(int senderId, int receiverId,decimal amount, string? comment); 
        Task SaveAsync();

        Task<ApiResponse<string>> Deposit(int accountId, decimal amount, string? comment, TransactionType type, int? rentalId = null);
        Task<ApiResponse<string>> Withdraw(int accountId, decimal amount, string? comment, TransactionType type, int? rentalId = null);
        Task<ApiResponse<string>> DepositExternal(int accountId, decimal amount, string? comment);
        Task<ApiResponse<string>> WithdrawExternal(int accountId, decimal amount, string? comment); 

        Task<ApiResponse<FinancialAccountDto>?> GetByNameAsync(string Name);

        // Returns all transactions for a given account, with rental context if applicable
        Task<List<FinancialTransactionDto>> GetTransactionsByAccountAsync(int accountId);
    }
}
