using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;
using RentalManagement.Repositories;
using System.Reflection;
using System.Threading.Tasks;

namespace RentalManagement.Services
{
    public class FinancialAccountService(IFinancialAccountRepository _financialAccountRepo, AppDbContext _context) : IFinancialAccountService
    {
        public async Task AddAsync(FinancialAccount financtialAccount, decimal amount)
        {
            await _financialAccountRepo.AddAsync(financtialAccount, amount);
            await SaveAsync();
        }
        public async Task<ApiResponse<string>> Transfer(
          int senderId,
          int receiverId,
          decimal amount,
          string? comment)
        {
            if (amount <= 0)
                return ApiResponse<string>.Failure("Amount must be greater than zero.");

            if (senderId == receiverId)
                return ApiResponse<string>.Failure("Cannot transfer to the same account.");

            var sender = await _financialAccountRepo.GetByIdAsync(senderId);
            var receiver = await _financialAccountRepo.GetByIdAsync(receiverId);

            if (sender == null || receiver == null)
                return ApiResponse<string>.Failure("Account not found.");

            if (sender.Balance < amount)
                return ApiResponse<string>.Failure("Insufficient balance.");

            using var dbTransaction = await _context.Database.BeginTransactionAsync();

            try
            {
                sender.Balance -= amount;
                receiver.Balance += amount;

                var withdrawTransaction = new FinancialTransaction
                {
                    FinancialAccountId = sender.Id,
                    TransactionType = TransactionType.Withdraw,
                    Amount = amount,
                    Description = $"Transfer to {receiver.Name}",
                    Notes = comment,
                    Time = DateTime.UtcNow
                };

                var depositTransaction = new FinancialTransaction
                {
                    FinancialAccountId = receiver.Id,
                    TransactionType = TransactionType.Deposit,
                    Amount = amount,
                    Description = $"Transfer from {sender.Name}",
                    Notes = comment,
                    Time = DateTime.UtcNow
                };

                await _context.FinancialTransactions.AddRangeAsync([withdrawTransaction, depositTransaction]);


                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                return ApiResponse<string>.Success("Transfer completed successfully.");
            }
            catch
            {
                await dbTransaction.RollbackAsync();
                return ApiResponse<string>.Failure("Transfer failed.");
            }
        }
        public async Task<ApiResponse<string>> Deposit(
             int accountId,
             decimal amount,
             string? comment , TransactionType type)
        {
            if (amount <= 0)
                return ApiResponse<string>.Failure("Amount must be greater than zero.");

            var account = await _financialAccountRepo.GetByIdAsync(accountId);

            if (account == null)
                return ApiResponse<string>.Failure("Account not found.");

            account.Balance += amount;

            var transaction = new FinancialTransaction
            {
                FinancialAccountId = account.Id,
                TransactionType = type,
                Amount = amount,
                Description = "External deposit",
                Notes = comment,
                Time = DateTime.UtcNow
            };

            await _context.FinancialTransactions.AddAsync(transaction);

            return ApiResponse<string>.Success("Deposit completed.");
        }
        public async Task<ApiResponse<List<FinancialAccountDto>>> GetAllAsync()
        {
            var financialAccounts = await _financialAccountRepo.GetAllAsync();
            if (financialAccounts == null)
            {
                return ApiResponse<List<FinancialAccountDto>>.Failure("Sorry, No Accounts are found!");
            }

            return ApiResponse<List<FinancialAccountDto>>.Success(financialAccounts.Select(_ => new FinancialAccountDto
            {
                Id = _.Id,
                Balance = _.Balance,
                Name = _.Name,
                accountType = _.accountType,
            }).ToList());

        }

        public async Task<ApiResponse<FinancialAccountDto>?> GetByIdAsync(int id)
        {
            var account = await _financialAccountRepo.GetByIdAsync(id);
            if (account == null)
            {
                return ApiResponse<FinancialAccountDto>.Failure("Sorry,Accounts not found!");
            }
            var dto = new FinancialAccountDto
            {
                Id = account.Id,
                Name = account.Name,
                Balance = account.Balance,
                accountType = account.accountType
            };

            return ApiResponse<FinancialAccountDto>.Success(dto);


        }

        public async Task<ApiResponse<FinancialAccountDto>?> GetByNameAsync(string Name)
        {
            var financialAccount = await _context.FinancialAccounts
                 .FirstOrDefaultAsync(_ => _.Name == Name);
            if (financialAccount == null)
            {
                return ApiResponse<FinancialAccountDto>.Failure("The account not found!");
            }
            var dto = new FinancialAccountDto()
            {
                Id = financialAccount.Id,
                accountType = financialAccount.accountType,
                Balance = financialAccount.Balance

            };
            return ApiResponse<FinancialAccountDto>.Success(dto);
        }

        public async Task SaveAsync()
        {
            await _financialAccountRepo.SaveAsync();
        }




        public async Task UpdateAsync(FinancialAccount financialAccount)
        {
            _financialAccountRepo.UpdateAsync(financialAccount);
            await SaveAsync();
        }


        public async Task<ApiResponse<string>> Withdraw(
        int accountId,
        decimal amount,
        string? comment, TransactionType type)
        {
            if (amount <= 0)
                return ApiResponse<string>.Failure("Amount must be greater than zero.");

            var account = await _financialAccountRepo.GetByIdAsync(accountId);

            if (account == null)
                return ApiResponse<string>.Failure("Account not found.");

            if (account.Balance < amount)
                return ApiResponse<string>.Failure("Insufficient balance.");

            account.Balance -= amount;
            
            var transaction = new FinancialTransaction
            {
                FinancialAccountId = account.Id,
                TransactionType = type,
                Amount = amount,
                Description = "External withdraw",
                Notes = comment,
                Time = DateTime.UtcNow
            };

            await _context.FinancialTransactions.AddAsync(transaction);

            return ApiResponse<string>.Success("Withdraw completed.");
        }

        public async Task<ApiResponse<string>> DepositExternal(int accountId, decimal amount, string? comment)
        {
            var result = await Deposit(accountId, amount, comment,TransactionType.Deposit);

            if (!result.IsSuccess)
                return result;

            await _context.SaveChangesAsync();

            return result;
        }

        public async Task<ApiResponse<string>> WithdrawExternal(int accountId, decimal amount, string? comment)
        {
            var result = await Withdraw(accountId, amount, comment,TransactionType.Withdraw);

            if (!result.IsSuccess)
                return result;

            await _context.SaveChangesAsync();

            return result;
        }
    }
}
