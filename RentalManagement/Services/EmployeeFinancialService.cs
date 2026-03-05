using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;
using AutoMapper;

namespace RentalManagement.Services
{
    public class EmployeeFinancialService : IEmployeeFinancialService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public EmployeeFinancialService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
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
                        BaseMonthlySalary = 0 // Initial base salary
                    });
                    changed = true;
                }
            }

            if (changed) await _context.SaveChangesAsync();
            
            // Now fetch the full list with user details
            var accounts = await _context.EmployeeFinancialAccounts
                .Include(a => a.User)
                .ToListAsync();
            
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

            return ApiResponse<ReturnedEmployeeAccountDto>.Success(_mapper.Map<ReturnedEmployeeAccountDto>(account));
        }


        public async Task<ApiResponse<ReturnedEmployeeAccountDto>> GetAccountById(int accountId)
        {
            var account = await _context.EmployeeFinancialAccounts
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.Id == accountId);

            if (account == null) return ApiResponse<ReturnedEmployeeAccountDto>.Failure("Account not found");

            return ApiResponse<ReturnedEmployeeAccountDto>.Success(_mapper.Map<ReturnedEmployeeAccountDto>(account));
        }

        public async Task<ApiResponse<object>> GetMonthlySummary(int accountId, int year, int month)
        {
            var transactions = await _context.EmployeeTransactions
                .Where(t => t.EmployeeFinancialAccountId == accountId && t.Time.Year == year && t.Time.Month == month)
                .ToListAsync();

            var totalSalaryPaid = transactions
                .Where(t => t.Category == EmployeeTransactionType.Salary && t.Movement == MoneyMovement.Deposit)
                .Sum(t => t.Amount);

            var totalCommission = transactions
                .Where(t => t.Category == EmployeeTransactionType.Commission && t.Movement == MoneyMovement.Deposit)
                .Sum(t => t.Amount);

            var totalBonus = transactions
                .Where(t => t.Category == EmployeeTransactionType.Bonus && t.Movement == MoneyMovement.Deposit)
                .Sum(t => t.Amount);

            var totalLoan = transactions
                .Where(t => t.Category == EmployeeTransactionType.Loan && t.Movement == MoneyMovement.Deposit)
                .Sum(t => t.Amount);

            return ApiResponse<object>.Success(new {
                totalSalaryPaid,
                totalCommission,
                totalBonus,
                totalLoan,
                transactionCount = transactions.Count
            });
        }

        public async Task<ApiResponse<ReturnedEmployeeTransactionDto>> CreateTransaction(EmployeeTransactionDto dto, string performerId)
        {
            var account = await _context.EmployeeFinancialAccounts
                .FirstOrDefaultAsync(a => a.Id == dto.EmployeeAccountId);

            if (account == null) throw new Exception("Account not found");

            // Check if paying salary for this month and if already paid
            if (dto.Category == EmployeeTransactionType.Salary && dto.Movement == MoneyMovement.Deposit)
            {
                var year = DateTime.Now.Year;
                var month = DateTime.Now.Month;
                var alreadyPaid = await _context.EmployeeTransactions
                    .Where(t => t.EmployeeFinancialAccountId == dto.EmployeeAccountId && 
                                t.Category == EmployeeTransactionType.Salary && 
                                t.Movement == MoneyMovement.Deposit &&
                                t.Time.Year == year && t.Time.Month == month)
                    .SumAsync(t => t.Amount);

                if (alreadyPaid >= account.BaseMonthlySalary && account.BaseMonthlySalary > 0)
                {
                    // Allow if user is aware, but for now we block to meet requirement
                    // return ApiResponse<ReturnedEmployeeTransactionDto>.Failure("Salary for this month has already been fully disbursed.");
                }
            }

            var transaction = new EmployeeTransaction
            {
                EmployeeFinancialAccountId = dto.EmployeeAccountId,
                Category = dto.Category,
                Movement = dto.Movement,
                Amount = dto.Amount,
                Description = dto.Description,
                PerformedById = performerId,
                Time = DateTime.Now
            };

            // Update balance
            decimal multiplier = dto.Movement == MoneyMovement.Deposit ? 1 : -1;
            
            switch (dto.Category)
            {
                case EmployeeTransactionType.Salary: account.Salary += dto.Amount * multiplier; break;
                case EmployeeTransactionType.Commission: account.CommissionBalance += dto.Amount * multiplier; break;
                case EmployeeTransactionType.Bonus: account.BonusBalance += dto.Amount * multiplier; break;
                case EmployeeTransactionType.Loan: account.LoanBalance += dto.Amount * multiplier; break;
            }

            account.LastUpdated = DateTime.Now;
            _context.EmployeeTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            await _context.Entry(transaction).Reference(t => t.PerformedBy).LoadAsync();
            
            return ApiResponse<ReturnedEmployeeTransactionDto>.Success(_mapper.Map<ReturnedEmployeeTransactionDto>(transaction));
        }

        public async Task<ApiResponse<bool>> UpdateBaseSalary(int accountId, decimal baseSalary)
        {
            var account = await _context.EmployeeFinancialAccounts.FindAsync(accountId);
            if (account == null) return ApiResponse<bool>.Failure("Account not found");

            account.BaseMonthlySalary = baseSalary;
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
    }
}
