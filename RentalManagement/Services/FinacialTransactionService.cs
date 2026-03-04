using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public class FinacialTransactionService(AppDbContext _context) : IFinacialTransactionService
    {
        public async Task<ApiResponse<List<FinancialTransactionDto>>> FilterTransactions(TransactionFilterDto dto)
        {
            var query = _context.FinancialTransactions
                .AsQueryable();
            if (dto.FinancialTransactionId.HasValue)
            {
                query = query.Where(_ => _.FinancialAccountId == dto.FinancialTransactionId);
            }
            if (dto.TransactionType.HasValue)
            {
                query = query.Where(_ => _.TransactionType == dto.TransactionType);
            }
            if (dto.Time.HasValue)
            {
                var date = dto.Time.Value;
                var start = date.ToDateTime(TimeOnly.MinValue);   // 00:00:00
                var end = date.ToDateTime(TimeOnly.MaxValue);     // 23:59:59.9999999

                query = query.Where(t => t.Time >= start && t.Time <= end);
            }

            var result = await query
                .Select(_ => new FinancialTransactionDto
                {
                    Amount = _.Amount,
                    FinancialAccountId = _.FinancialAccountId,
                    TransactionType = _.TransactionType,
                    Time = _.Time,
                    Notes = _.Notes,
                    Description = _.Description
                })
                .ToListAsync();

            return ApiResponse<List<FinancialTransactionDto>>.Success(result);
        }

        public async Task<ApiResponse<List<FinancialTransactionDto>>> GetAllAsync()
        {
            var transactions =  await _context.FinancialTransactions
                .AsNoTracking()
                .ToListAsync();

            return ApiResponse<List<FinancialTransactionDto>>.Success(transactions.Select(_ => new FinancialTransactionDto
            {
                Amount = _.Amount,
                FinancialAccountId = _.FinancialAccountId,
                TransactionType = _.TransactionType,
                Time = _.Time,
                Notes = _.Notes,
                Description = _.Description

            }).ToList()); 

        }

   
    }
}
