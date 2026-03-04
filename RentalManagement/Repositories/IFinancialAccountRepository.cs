using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public interface IFinancialAccountRepository
    {
        Task<FinancialAccount?> GetByIdAsync(int? id);
        Task<List<FinancialAccount>> GetAllAsync();
        Task AddAsync(FinancialAccountDto dto);
        Task<string> UpdateAsync(UpdateFinancialAccountDto dto);
        Task SaveAsync();
    }
}
