using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using RentalManagement.DTOs;
using RentalManagement.Entities;
using RentalManagement.Repositories;

namespace RentalManagement.Services
{
    public class EmployeeFinancialService : IEmployeeFinancialService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IFinancialAccountRepository _FinancialAccountRep;

        public EmployeeFinancialService(AppDbContext context, IMapper mapper , IFinancialAccountRepository finanacialAccountRep)
        {
            _context = context;
            _mapper = mapper;
            _FinancialAccountRep = finanacialAccountRep; 
        }

        public async Task<ApiResponse<List<ReturnedEmployeeAccountDto>>> GetAllAccounts()
        {
            // Ensure all users have a financial account record
            var users = await _context.Users.ToListAsync();
            var existingUserIds = await _context.EmployeeFinancialAccounts.Select(a => a.UserId).ToListAsync();

            bool changed = false;
            foreach (var user in users)
            {
                if (!existingUserIds.Contains(user.Id))
                {
                    _context.EmployeeFinancialAccounts.Add(new EmployeeFinancialAccount 
                    { 
                        UserId = user.Id,
                        BaseMonthlySalary = 0 
                    });
                    changed = true;
                }
            }

            if (changed) await _context.SaveChangesAsync();
            
            // Now fetch the full list with user details
            var accounts = await _context.EmployeeFinancialAccounts
                .Include(a => a.User)
                .ToListAsync();
                
            foreach (var account in accounts)
            {
                await AttachCalculatedBalances(account);
            }
            
            return ApiResponse<List<ReturnedEmployeeAccountDto>>.Success(_mapper.Map<List<ReturnedEmployeeAccountDto>>(accounts));
        }

        public async Task<ApiResponse<ReturnedEmployeeAccountDto>> GetAccountByUserId(string userId)
        {
            var account = await _context.EmployeeFinancialAccounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.UserId == userId);

            if (account == null)
            {
                // Auto-create account if it doesn't exist
                account = new EmployeeFinancialAccount { UserId = userId };
                _context.EmployeeFinancialAccounts.Add(account);
                await _context.SaveChangesAsync();
                
                await _context.Entry(account).Reference(a => a.User).LoadAsync();
            }
            
            await AttachCalculatedBalances(account);

            return ApiResponse<ReturnedEmployeeAccountDto>.Success(_mapper.Map<ReturnedEmployeeAccountDto>(account));
        }


        public async Task<ApiResponse<ReturnedEmployeeAccountDto>> GetAccountById(int accountId)
        {
            var account = await _context.EmployeeFinancialAccounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == accountId);

            if (account == null) return ApiResponse<ReturnedEmployeeAccountDto>.Failure("Account not found");

            await AttachCalculatedBalances(account);

            return ApiResponse<ReturnedEmployeeAccountDto>.Success(_mapper.Map<ReturnedEmployeeAccountDto>(account));
        }

        public async Task<ApiResponse<object>> GetMonthlySummaryOrYearly( int accountId, int year, int? month)
        {
            var account = await _context.EmployeeFinancialAccounts
                .FirstOrDefaultAsync(_ => _.Id == accountId); 
            if (account == null)
            {
                return ApiResponse<object>.Failure("Account is not found");
            }

            var transactions = await _context.EmployeeTransactions
                .Where(t => t.EmployeeFinancialAccountId == accountId && t.Time.Year == year && t.Time.Month == month)
                .ToListAsync();

            var totalSalaryPaid = transactions
                .Where(t => t.Category == EmployeeTransactionType.Salary && t.Type == TransactionType.Deposit)
                .Sum(t => t.Amount);

            var totalCommissionPaid = transactions
                .Where(t => t.Category == EmployeeTransactionType.Commission && t.Type == TransactionType.Deposit)
                .Sum(t => t.Amount);

            var totalBonusPaid = transactions
                .Where(t => t.Category == EmployeeTransactionType.Bonus && t.Type == TransactionType.Deposit)
                .Sum(t => t.Amount);

            var totalLoan = transactions
                .Where(t => t.Category == EmployeeTransactionType.Loan && t.Type == TransactionType.Deposit)
                .Sum(t => t.Amount);

            return ApiResponse<object>.Success(new {
                totalSalaryPaid,
                totalCommissionPaid,
                totalBonusPaid,
                totalLoan,
                transactionCount = transactions.Count
            });
        }

        public async Task<ApiResponse<ReturnedEmployeeTransactionDto>> CreateTransaction(EmployeeTransactionDto dto, string performerId)
        {
            var account = await _context.EmployeeFinancialAccounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == dto.EmployeeAccountId);

            if (account == null)
                return ApiResponse<ReturnedEmployeeTransactionDto>.Failure("No Account is Found");

            bool isCompanyPaying = dto.Movement == MoneyMovement.Deposit;

            // Balance Validations
            if (isCompanyPaying)
            {
                if (dto.Category == EmployeeTransactionType.Salary && dto.Amount > account.RemainingMonthlySalary)
                    return ApiResponse<ReturnedEmployeeTransactionDto>.Failure($"Amount exceeds remaining salary.");
                if (dto.Category == EmployeeTransactionType.Commission && dto.Amount > account.RemainingCommission)
                    return ApiResponse<ReturnedEmployeeTransactionDto>.Failure($"Amount exceeds remaining commission.");
                if (dto.Category == EmployeeTransactionType.Bonus && dto.Amount > account.RemainingBonusBalance)
                    return ApiResponse<ReturnedEmployeeTransactionDto>.Failure($"Amount exceeds remaining bonus.");
            }
            else
            {
                if (dto.Category == EmployeeTransactionType.Loan && dto.Amount > account.LoanBalance)
                    return ApiResponse<ReturnedEmployeeTransactionDto>.Failure($"Amount exceeds loan balance.");
            }

            using var tran = await _context.Database.BeginTransactionAsync();

            try
            {
                // Handle company account transfer
                if (isCompanyPaying)
                {
                    var bankResult = await TransferToEmployee(dto.FromAccountId, dto.Amount, account.User?.UserName ?? "Unknown");
                    if (!bankResult.IsSuccess) return ApiResponse<ReturnedEmployeeTransactionDto>.Failure(bankResult.Message);
                }
                else
                {
                    var receiveResult = await ReceiveFromEmployee(dto.FromAccountId, dto.Amount, account.User?.UserName ?? "Unknown");
                    if (!receiveResult.IsSuccess) return ApiResponse<ReturnedEmployeeTransactionDto>.Failure(receiveResult.Message);
                }

                var transaction = new EmployeeTransaction
                {
                    EmployeeFinancialAccountId = dto.EmployeeAccountId,
                    FinancialAccountId = dto.FromAccountId, // Required back-reference
                    Category = dto.Category,
                    Type = dto.Movement == MoneyMovement.Deposit ? TransactionType.Deposit : TransactionType.Withdraw,
                    Amount = dto.Amount,
                    Description = dto.Description,
                    PerformedById = performerId,
                    Time = DateTime.Now
                };

                // Update Employee Balances
                if (isCompanyPaying)
                {
                    // Paid to employee -> decrease remaining balances
                    if (dto.Category == EmployeeTransactionType.Salary) account.RemainingMonthlySalary -= dto.Amount;
                    if (dto.Category == EmployeeTransactionType.Commission) account.RemainingCommission -= dto.Amount;
                    if (dto.Category == EmployeeTransactionType.Bonus) account.RemainingBonusBalance -= dto.Amount;
                    if (dto.Category == EmployeeTransactionType.Loan) account.LoanBalance += dto.Amount; // giving loan -> owes more
                }
                else
                {
                    // Received from employee -> increase remaining balances or pay off loan
                    if (dto.Category == EmployeeTransactionType.Salary) account.RemainingMonthlySalary += dto.Amount;
                    if (dto.Category == EmployeeTransactionType.Commission) account.RemainingCommission += dto.Amount;
                    if (dto.Category == EmployeeTransactionType.Bonus) account.RemainingBonusBalance += dto.Amount;
                    if (dto.Category == EmployeeTransactionType.Loan) account.LoanBalance -= dto.Amount; // paying off loan
                }

                account.LastUpdated = DateTime.Now;

                _context.EmployeeTransactions.Add(transaction);

                await _context.SaveChangesAsync();

                await tran.CommitAsync();

                await _context.Entry(transaction)
                    .Reference(t => t.PerformedBy)
                    .LoadAsync();

                return ApiResponse<ReturnedEmployeeTransactionDto>
                    .Success(_mapper.Map<ReturnedEmployeeTransactionDto>(transaction));
            }
            catch (Exception ex)
            {
                await tran.RollbackAsync();
                return ApiResponse<ReturnedEmployeeTransactionDto>.Failure(ex.Message);
            }
        }

        public async Task<ApiResponse<bool>> UpdateBaseSalary(int accountId, decimal baseSalary)
        {
            var account = await _context.EmployeeFinancialAccounts.FindAsync(accountId);
            if (account == null) return ApiResponse<bool>.Failure("Account not found");

            account.BaseMonthlySalary = baseSalary;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Success(true);
        }

        public async Task<ApiResponse<bool>> AddEarnings(AddEarningsDto dto, string performerId)
        {
            if (dto.Amount <= 0) return ApiResponse<bool>.Failure("Amount must be greater than zero");

            var account = await _context.EmployeeFinancialAccounts.FirstOrDefaultAsync(a => a.Id == dto.EmployeeAccountId);
            if (account == null) return ApiResponse<bool>.Failure("Account not found");

            if (dto.Category == EmployeeTransactionType.Commission)
            {
                account.CommissionBalance += dto.Amount;
                account.RemainingCommission += dto.Amount;
            }
            else if (dto.Category == EmployeeTransactionType.Bonus)
            {
                account.TotalBonusBalance += dto.Amount;
                account.RemainingBonusBalance += dto.Amount;
            }
            else if (dto.Category == EmployeeTransactionType.Salary)
            {
                account.BaseMonthlySalary += dto.Amount;
                account.RemainingMonthlySalary += dto.Amount;
            }
            else
            {
                return ApiResponse<bool>.Failure("Only Commission, Bonus, and Salary can be added as earnings directly.");
            }

            account.LastUpdated = DateTime.Now;

            var history = new EarningsHistory
            {
                EmployeeFinancialAccountId = account.Id,
                Category = dto.Category,
                Amount = dto.Amount,
                Description = $"Added {dto.Category} to employee wallet",
                PerformedById = performerId,
                Time = DateTime.Now
            };
            
            _context.EarningsHistories.Add(history);
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Success(true);
        }

        public async Task<ApiResponse<List<ReturnedEmployeeTransactionDto>>> GetAccountTransactions(int accountId)
        {
            var transactions = await _context.EmployeeTransactions
                .Include(t => t.PerformedBy)
                .Where(t => t.EmployeeFinancialAccountId == accountId)
                .OrderByDescending(t => t.Time)
                .ToListAsync();

            return ApiResponse<List<ReturnedEmployeeTransactionDto>>.Success(_mapper.Map<List<ReturnedEmployeeTransactionDto>>(transactions));
        }

        public async Task<ApiResponse<List<ReturnedEarningsHistoryDto>>> GetEarningsHistory(int accountId)
        {
            var history = await _context.EarningsHistories
                .Include(h => h.PerformedBy)
                .Where(h => h.EmployeeFinancialAccountId == accountId)
                .OrderByDescending(h => h.Time)
                .ToListAsync();

            return ApiResponse<List<ReturnedEarningsHistoryDto>>.Success(_mapper.Map<List<ReturnedEarningsHistoryDto>>(history));
        }

       

        public async Task<ApiResponse<string>> TransferToEmployee(int FromAccountId, decimal amount, string employeeName)
        {
            if (amount <= 0)
                return ApiResponse<string>.Failure("Amount must be greater than zero.");

            var account = await _FinancialAccountRep.GetByIdAsync(FromAccountId);

            if (account == null)
                return ApiResponse<string>.Failure("Account not found.");

            if (account.Balance < amount)
                return ApiResponse<string>.Failure("Insufficient balance.");

            account.Balance -= amount;
            var transaction = new FinancialTransaction
            {
                FinancialAccountId = account.Id,
                TransactionType = TransactionType.Withdraw,
                Amount = amount,
                Description = $"Paid to employee - {employeeName}",
                Time = DateTime.UtcNow
            };
            await _context.FinancialTransactions.AddAsync(transaction);

            return ApiResponse<string>.Success("Transfer completed.");
        }

        public async Task<ApiResponse<string>> ReceiveFromEmployee(int ToAccountId, decimal amount, string employeeName)
        {
            if (amount <= 0)
                return ApiResponse<string>.Failure("Amount must be greater than zero.");

            var account = await _FinancialAccountRep.GetByIdAsync(ToAccountId);

            if (account == null)
                return ApiResponse<string>.Failure("Account not found.");

            account.Balance += amount;
            var transaction = new FinancialTransaction
            {
                FinancialAccountId = account.Id,
                TransactionType = TransactionType.Deposit,
                Amount = amount,
                Description = $"Received from employee - {employeeName}",
                Time = DateTime.UtcNow
            };
            await _context.FinancialTransactions.AddAsync(transaction);

            return ApiResponse<string>.Success("Receive completed.");
        }


      

        private async Task AttachCalculatedBalances(EmployeeFinancialAccount account)
        {
            var now = DateTime.Now;
            bool neededUpdate = false;
            
            // Commission
            var totalEarnedCommission = await _context.RentalSales
                .Where(rs => rs.SalesRepresentativeId == account.UserId)
                .SumAsync(rs => (decimal?)rs.CommissionAmount) ?? 0m;

            var totalPaidCommission = await _context.EmployeeTransactions
                .Where(t => t.EmployeeFinancialAccountId == account.Id 
                         && t.Category == EmployeeTransactionType.Commission 
                         && t.Type == TransactionType.Deposit)
                .SumAsync(t => (decimal?)t.Amount) ?? 0m;

            if (account.CommissionBalance != totalEarnedCommission || account.RemainingCommission != (totalEarnedCommission - totalPaidCommission))
            {
                account.CommissionBalance = totalEarnedCommission;
                account.RemainingCommission = totalEarnedCommission - totalPaidCommission;
                neededUpdate = true;
            }

            // Salary - Calculate remaining for current month
            var totalPaidSalaryThisMonth = await _context.EmployeeTransactions
                .Where(t => t.EmployeeFinancialAccountId == account.Id
                         && t.Category == EmployeeTransactionType.Salary
                         && t.Type == TransactionType.Deposit
                         && t.Time.Year == now.Year
                         && t.Time.Month == now.Month)
                .SumAsync(t => (decimal?)t.Amount) ?? 0m;

            var calculatedRemainingSalary = account.BaseMonthlySalary - totalPaidSalaryThisMonth;
            if (account.RemainingMonthlySalary != calculatedRemainingSalary)
            {
                account.RemainingMonthlySalary = calculatedRemainingSalary;
                neededUpdate = true;
            }
            
            // Bonus
            var totalEarnedBonus = await _context.EarningsHistories
                .Where(h => h.EmployeeFinancialAccountId == account.Id && h.Category == EmployeeTransactionType.Bonus)
                .SumAsync(h => (decimal?)h.Amount) ?? 0m;
                
            var totalPaidBonus = await _context.EmployeeTransactions
                .Where(t => t.EmployeeFinancialAccountId == account.Id
                         && t.Category == EmployeeTransactionType.Bonus
                         && t.Type == TransactionType.Deposit)
                .SumAsync(t => (decimal?)t.Amount) ?? 0m;
                
            if (account.TotalBonusBalance != totalEarnedBonus || account.RemainingBonusBalance != (totalEarnedBonus - totalPaidBonus))
            {
                account.TotalBonusBalance = totalEarnedBonus;
                account.RemainingBonusBalance = totalEarnedBonus - totalPaidBonus;
                neededUpdate = true;
            }

            if (neededUpdate)
            {
                account.LastUpdated = now;
                await _context.SaveChangesAsync();
            }
        }
    }
}
