using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public interface IFinancialAccountRepository
    {
        Task<FinancialAccount?> GetByIdAsync(int? id);
        Task<List<FinancialAccount>> GetAllAsync();
        Task AddAsync(FinancialAccount financtialAccount , decimal amount);
        void UpdateAsync(FinancialAccount financialAccount);
        Task SaveAsync();
    }
}
