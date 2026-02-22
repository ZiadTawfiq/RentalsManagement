using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public class CommissionService(AppDbContext _context) : ICommissionService
    {
        public async Task<ApiResponse<decimal>> GetCampainCommission()
        {
            var commision = await _context.RentalSettlements
                 .SumAsync(_ => _.CampainMoney ?? 0);
            return ApiResponse<decimal>.Success(commision);

        }
        public async Task<ApiResponse<List<ReturnedCommissionSalesDto>>> GetAllSalesRepCommission()
        {
            var result = _context.RentalSales
                .Include(_ => _.SalesRepresentative)
                .GroupBy(rs => new
                {
                    rs.SalesRepresentative.Id,
                    rs.SalesRepresentative.UserName,

                })
                .Select(_ => new ReturnedCommissionSalesDto
                {
                    TotalCommission = _.Sum(_ => _.CommissionAmount),
                    NumOfRentals = _.Count(),
                    SalesRepName = _.Key.UserName

                }).ToList();
            if (result == null)
            {
                return ApiResponse<List<ReturnedCommissionSalesDto>>.Failure("list is empty!");
            }
            return ApiResponse<List<ReturnedCommissionSalesDto>>.Success(result);



        }
        public async Task<ApiResponse<CommissionReportDto>> FilterCommission(CommissionFilterDto dto)
        {
            var query = _context.RentalSales
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
            var totalCommission = await query.SumAsync(_ => _.CommissionAmount);

            return ApiResponse<CommissionReportDto>.Success(new CommissionReportDto
            {
                TotalCommision = totalCommission,
                PropetyId = dto.PropertyId,
                UnitId = dto.unitId,
                SalesRepId = dto.SalesId,
            });



        }

    }
}
