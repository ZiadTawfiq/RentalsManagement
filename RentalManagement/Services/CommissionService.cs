using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public class CommissionService(AppDbContext _context) : ICommissionService
    {
        public async Task<ApiResponse<decimal>> GetCampaignCommission()
        {
            var commission = await _context.RentalSettlements
                 .SumAsync(_ => _.CampainMoney ?? 0);
            return ApiResponse<decimal>.Success(commission);
        }
        public async Task<ApiResponse<List<ReturnedCommissionSalesDto>>> GetAllSalesRepCommission()
        {
            var result = await _context.RentalSales
                .Include(_ => _.SalesRepresentative)
                .Where(rs => rs.SalesRepresentative != null)
                .GroupBy(rs => new
                {
                    rs.SalesRepresentative.Id,
                    rs.SalesRepresentative.UserName,
                })
                .Select(_ => new ReturnedCommissionSalesDto
                {
                    TotalCommission = _.Sum(x => x.CommissionAmount),
                    NumOfRentals = _.Count(),
                    SalesRepName = _.Key.UserName
                })
                .ToListAsync();

            if (result == null)
            {
                return ApiResponse<List<ReturnedCommissionSalesDto>>.Failure("List is empty!");
            }
            return ApiResponse<List<ReturnedCommissionSalesDto>>.Success(result);
        }
        public async Task<ApiResponse<CommissionReportDto>> FilterCommission(CommissionFilterDto dto)
        {
            var query = _context.RentalSales
               .Include(s => s.Rental)
                  .ThenInclude(r => r.Unit)
               .Include(s => s.Rental)
                  .ThenInclude(r => r.Property)
               .Include(s => s.Rental)
                  .ThenInclude(r => r.RentalSettlement)
               .AsNoTracking();

            if (!string.IsNullOrEmpty(dto.SalesId))
            {
                query = query.Where(_ => _.SalesRepresentativeId == dto.SalesId);
            }
            if (dto.PropertyId.HasValue)
            {
                query = query.Where(_ => _.Rental.PropertyId == dto.PropertyId.Value);
            }
            if (dto.unitId.HasValue)
            {
                query = query.Where(_ => _.Rental.UnitId == dto.unitId.Value);
            }

            var salesList = await query.ToListAsync();

            var detailed = salesList.Select(s => new DetailedCommissionDto
            {
                UnitCode = s.Rental.Unit?.Code ?? "N/A",
                PropertyName = s.Rental.Property?.Name ?? "N/A",
                StartDate = s.Rental.StartDate.ToString(),
                EndDate = s.Rental.EndDate.ToString(),
                SalesCommission = s.CommissionAmount,
                CampaignCommission = s.Rental.RentalSettlement?.CampainMoney ?? 0
            }).ToList();

            var totalSales = detailed.Sum(d => d.SalesCommission);
            var totalCampaign = detailed.Sum(d => d.CampaignCommission);

            return ApiResponse<CommissionReportDto>.Success(new CommissionReportDto
            {
                TotalSalesCommission = totalSales,
                TotalCampaignAmount = totalCampaign,
                PropertyId = dto.PropertyId,
                UnitId = dto.unitId,
                SalesRepId = dto.SalesId,
                DetailedCommission = detailed
            });
        }

    }
}
