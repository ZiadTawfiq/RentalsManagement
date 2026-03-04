using Microsoft.EntityFrameworkCore;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public class FinancialAccountRepository(AppDbContext _context) : IFinancialAccountRepository
    {
        public async Task AddAsync(FinancialAccount financtialAccount , decimal amount)
        {
            bool exist = await _context.FinancialAccounts.AnyAsync(_ => _.Name == financtialAccount.Name); 
            if (exist)
            {
                return;
            }
            var fincialAccount = new FinancialAccount()
            {
                accountType = financtialAccount.accountType,
                Balance = amount,
                Name = financtialAccount.Name,
            };
            await _context.FinancialAccounts.AddAsync(fincialAccount);

        }

        public async Task<List<FinancialAccount>> GetAllAsync()
        {
           return await _context.FinancialAccounts.ToListAsync();
        }

        public async Task<FinancialAccount?> GetByIdAsync(int? id)
        {

            return await _context.FinancialAccounts.FindAsync(id);

        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync(); 
        }

        public void UpdateAsync(FinancialAccount financialAccount)
        {
            _context.FinancialAccounts.Update(financialAccount);
        }

    
        }
    }

