using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Services
{
    public interface IExternalAccountService
    {
        Task<ApiResponse<List<ReturnedExternalAccountDto>>> GetAccounts();
        Task<ApiResponse<ReturnedExternalAccountDto>> AddAccount(ExternalAccountDto dto);
        Task<ApiResponse<bool>> AddTransaction(ExternalTransactionDto dto, IFormFile? proofImage, string userId);
        Task<ApiResponse<List<ReturnedExternalTransactionDto>>> GetHistory(int? accountId);
    }

    public class ExternalAccountService : IExternalAccountService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;

        public ExternalAccountService(AppDbContext context, IMapper mapper, IWebHostEnvironment env)
        {
            _context = context;
            _mapper = mapper;
            _env = env;
        }

        public async Task<ApiResponse<List<ReturnedExternalAccountDto>>> GetAccounts()
        {
            var accounts = await _context.ExternalAccounts
                .Include(a => a.Transactions)
                .ToListAsync();

            var dtos = accounts.Select(a => {
                var dto = _mapper.Map<ReturnedExternalAccountDto>(a);
                dto.Balances = a.Transactions
                    .GroupBy(t => t.Currency)
                    .Select(g => new CurrencyBalanceDto
                    {
                        Currency = g.Key,
                        // Credit (they owe us) increases balance, Debit (we owe them) decreases it
                        TotalBalance = g.Sum(t => t.Type == "Credit" ? t.Amount : -t.Amount)
                    })
                    .ToList();
                return dto;
            }).ToList();

            return ApiResponse<List<ReturnedExternalAccountDto>>.Success(dtos);
        }

        public async Task<ApiResponse<ReturnedExternalAccountDto>> AddAccount(ExternalAccountDto dto)
        {
            var account = _mapper.Map<ExternalAccount>(dto);
            _context.ExternalAccounts.Add(account);
            await _context.SaveChangesAsync();
            return ApiResponse<ReturnedExternalAccountDto>.Success(_mapper.Map<ReturnedExternalAccountDto>(account));
        }

        public async Task<ApiResponse<bool>> AddTransaction(ExternalTransactionDto dto, IFormFile? proofImage, string userId)
        {
            var account = await _context.ExternalAccounts.FindAsync(dto.ExternalAccountId);
            if (account == null) return ApiResponse<bool>.Failure("Account not found");

            var transaction = _mapper.Map<ExternalTransaction>(dto);
            transaction.PerformedById = userId;
            transaction.Date = DateTime.Now;

            if (proofImage != null)
            {
                string webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                string uploadsFolder = Path.Combine(webRoot, "uploads", "external_proofs");
                
                if (!Directory.Exists(uploadsFolder)) 
                    Directory.CreateDirectory(uploadsFolder);

                string uniqueFileName = Guid.NewGuid().ToString() + "_" + proofImage.FileName;
                string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await proofImage.CopyToAsync(fileStream);
                }
                transaction.ProofImagePath = "/uploads/external_proofs/" + uniqueFileName;
            }

            _context.ExternalTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return ApiResponse<bool>.Success(true);
        }

        public async Task<ApiResponse<List<ReturnedExternalTransactionDto>>> GetHistory(int? accountId)
        {
            var query = _context.ExternalTransactions
                .Include(t => t.ExternalAccount)
                .Include(t => t.PerformedBy)
                .AsQueryable();

            if (accountId.HasValue)
                query = query.Where(t => t.ExternalAccountId == accountId.Value);

            var transactions = await query.OrderByDescending(t => t.Date).ToListAsync();
            return ApiResponse<List<ReturnedExternalTransactionDto>>.Success(_mapper.Map<List<ReturnedExternalTransactionDto>>(transactions));
        }
    }
}
