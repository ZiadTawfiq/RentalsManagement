using Microsoft.EntityFrameworkCore;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public class FinacialTransactionRepository(AppDbContext _context) : IFinacialTransactionRepository
    {

        public async Task<List<FinancialTransaction>> GetAllAsync()
        {
            return await _context.FinancialTransactions.AsNoTracking().ToListAsync(); 
        }     
    
    }
}
