using AutoMapper;
using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Services
{
    public interface IInventoryService
    {
        Task<ApiResponse<List<ReturnedAssetDto>>> GetAssets();
        Task<ApiResponse<ReturnedAssetDto>> AddAsset(AssetDto dto);
        Task<ApiResponse<ReturnedAssetDto>> ModifyQuantity(AssetQuantityChangeDto dto, string performerId);
        Task<ApiResponse<List<ReturnedAssetTransactionDto>>> GetHistory();
    }

    public class InventoryService : IInventoryService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public InventoryService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApiResponse<List<ReturnedAssetDto>>> GetAssets()
        {
            var assets = await _context.Assets.OrderBy(a => a.Name).ToListAsync();
            return ApiResponse<List<ReturnedAssetDto>>.Success(_mapper.Map<List<ReturnedAssetDto>>(assets));
        }

        public async Task<ApiResponse<ReturnedAssetDto>> AddAsset(AssetDto dto)
        {
            var asset = _mapper.Map<Asset>(dto);
            _context.Assets.Add(asset);
            await _context.SaveChangesAsync();

            // Store initial quantity in history if provided
            if (asset.Quantity != 0)
            {
                var transaction = new AssetTransaction
                {
                    AssetId = asset.Id,
                    QuantityChanged = asset.Quantity,
                    Type = asset.Quantity > 0 ? AssetTransactionType.Addition : AssetTransactionType.Removal,
                    Description = "Initial stock entry",
                    Date = DateTime.Now
                    // PerformedById will be null if system-added, but we could pass it if needed
                };
                _context.AssetTransactions.Add(transaction);
                await _context.SaveChangesAsync();
            }

            return ApiResponse<ReturnedAssetDto>.Success(_mapper.Map<ReturnedAssetDto>(asset));
        }

        public async Task<ApiResponse<ReturnedAssetDto>> ModifyQuantity(AssetQuantityChangeDto dto, string performerId)
        {
            var asset = await _context.Assets.FindAsync(dto.AssetId);
            if (asset == null) return ApiResponse<ReturnedAssetDto>.Failure("Asset not found");

            asset.Quantity += dto.Amount;
            asset.LastUpdated = DateTime.Now;

            var transaction = new AssetTransaction
            {
                AssetId = asset.Id,
                QuantityChanged = dto.Amount,
                Type = dto.Amount > 0 ? AssetTransactionType.Addition : AssetTransactionType.Removal,
                Description = dto.Description ?? (dto.Amount > 0 ? $"Added {dto.Amount} units" : $"Removed {Math.Abs(dto.Amount)} units"),
                Date = DateTime.Now,
                PerformedById = performerId
            };

            _context.AssetTransactions.Add(transaction);
            await _context.SaveChangesAsync();

            return ApiResponse<ReturnedAssetDto>.Success(_mapper.Map<ReturnedAssetDto>(asset));
        }

        public async Task<ApiResponse<List<ReturnedAssetTransactionDto>>> GetHistory()
        {
            var transactions = await _context.AssetTransactions
                .Include(t => t.Asset)
                .Include(t => t.PerformedBy)
                .OrderByDescending(t => t.Date)
                .ToListAsync();
            return ApiResponse<List<ReturnedAssetTransactionDto>>.Success(_mapper.Map<List<ReturnedAssetTransactionDto>>(transactions));
        }
    }
}
