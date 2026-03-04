using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Services
{
    public interface IFinacialTransactionService
    {
        Task<ApiResponse<List<FinancialTransactionDto>>> GetAllAsync();
        Task<ApiResponse<List<FinancialTransactionDto>>> FilterTransactions(TransactionFilterDto dto); 
    }
}
