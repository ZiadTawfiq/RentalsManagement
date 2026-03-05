using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public class FinancialAccountRepository(AppDbContext _context) : IFinancialAccountRepository
    {
        public async Task AddAsync(FinancialAccountDto dto)
        {
            bool exist = await _context.FinancialAccounts.AnyAsync(_ => _.Name == dto.Name); 
            if (exist)
            {
                return;
            }
            var fincialAccount = new FinancialAccount()
            {
                accountType = dto.accountType,
                Balance = dto.Balance,
                Name = dto.Name,
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

        public async Task<string> UpdateAsync(UpdateFinancialAccountDto dto)
        {
            var account = await _context.FinancialAccounts
                 .FirstOrDefaultAsync(_ => _.Id == dto.Id);
            if (account == null)
            {
                return "Account not found!";
            }
            var existAccountWithSameName = await _context.FinancialAccounts
              .AnyAsync(_ => _.Name == dto.Name && _.Id != dto.Id);
            if (existAccountWithSameName)
            {
                return "There is an Account with same Name"; 
            }
            account.accountType = dto.Type;
            account.Name = dto.Name;
            if (dto.Balance.HasValue)
                account.Balance = dto.Balance.Value;
            return "Account Updated Successfully"; 

        }

    
        }
    }

