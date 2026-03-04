using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public interface IFinacialTransactionRepository
    {
        Task<List<FinancialTransaction>> GetAllAsync();
      
    }
}
