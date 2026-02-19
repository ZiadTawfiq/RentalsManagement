using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Repositories
{
    public class RentalRepository(AppDbContext _context) : IRentalRepository
    {
        public async Task<ApiResponse<string>> DeleteRental(int RentalId)
        {
            var rental = await _context.Rentals
                 .Include(_ => _.RentalSales)
                 .Include(_ => _.RentalSettlement)
                 .FirstOrDefaultAsync(_ => _.Id == RentalId);
            if (rental == null)
            {
                return ApiResponse<string>.Failure("No Rental is Found!"); 
            }

            _context.RentalSales.RemoveRange(rental.RentalSales); 

            if (rental.RentalSettlement != null)
            {
                _context.RentalSettlements.Remove(rental.RentalSettlement);
            }
            _context.Rentals.Remove(rental);
            await _context.SaveChangesAsync();
            return ApiResponse<string>.Success("Rental already Deleted");
                 
            
        }

        public Task<ApiResponse<ReturnedRentalDto>> FilterRental(int? PropertyId, int? OwnerId, int? unitId, string? SalesRepId)
        {
            throw new NotImplementedException();
        }

        public async Task<ApiResponse<List<ReturnedRentalDto>>> GetAllRentals()
        {
            var rentals = await _context.Rentals
                .Include(r => r.RentalSettlement)
                .Include(r => r.Unit)
                .Include(r => r.Owner)
                .Include(r => r.Property)
                .Include(r => r.RentalNotes)
                .Include(r => r.RentalSales)
                    .ThenInclude(rs => rs.SalesRepresentative)
                .Include(r => r.RentalNotes)
                    .ThenInclude(rn => rn.AddedByEmployee)
                .ToListAsync();

            var result = rentals.Select(r => new ReturnedRentalDto
            {
                Id = r.Id,
                UnitId = r.UnitId,
                UnitCode = r.Unit?.Code ?? "N/A",
                OwnerId = r.OwnerId,
                OwnerName = r.Owner?.Name ?? "N/A",
                PropertyId = r.PropertyId,
                PropertyName = r.Property?.Name ?? "N/A",

                StartDate = r.StartDate,
                EndDate = r.EndDate,

                DayPriceCustomer = r.DayPriceCustomer,
                DayPriceOwner = r.DayPriceOwner,

                CustomerDeposit = r.CustomerDeposit,
                CustomerOutstanding = r.RentalSettlement?.CustomerOutstanding ?? 0,
                OwnerDeposit = r.OwnerDeposit,
                OwnerRemaining = r.RentalSettlement?.OwnerRemaining ?? 0,
                SecurityDeposit = r.SecurityDeposit,

                TotalDays = r.EndDate.DayNumber - r.StartDate.DayNumber,
                TotalAmount = (r.EndDate.DayNumber - r.StartDate.DayNumber) * r.DayPriceCustomer,

                HasCampaignDiscount = r.HasCampaignDiscount,

                CustomerFullName = r.CustomerFullName,
                CustomerPhoneNumber = r.CustomerPhoneNumber,

                LastNote = r.RentalNotes?.OrderByDescending(n => n.CreatedAt).FirstOrDefault()?.Content,

                TotalCommision = r.RentalSettlement?.SalesCommission ?? 0,


                Sales = r.RentalSales
                      .Select(rs => new ReturnedRentalSalesDto
                      {
                          SalesRepresentativeId = rs.SalesRepresentativeId,
                          SalesRepName = rs.SalesRepresentative?.UserName ?? "UNKNOWN",
                          Percentage = rs.CommissionPercentage,
                          CommissionAmount = rs.CommissionAmount
                      })
                      .ToList(),

                RentalNotes = r.RentalNotes?
                      .Select(rn => new ReturnedRentalNoteDto
                      {
                          Id = rn.Id,
                          Content = rn.Content,
                          CreatedAt = rn.CreatedAt,
                          AddedByEmployeeName = rn.AddedByEmployee?.UserName ?? "System"
                      })
                      .OrderByDescending(n => n.CreatedAt)
                      .ToList()

            }).ToList();
            return ApiResponse<List<ReturnedRentalDto>>.Success(result);
        }


        public async Task<ApiResponse<List<ReturnedRentalDto>>> ViewRentalsForEmployeeById(string EmployeeId)
        {
            var rentals = await _context.Rentals
                  .Include(r => r.RentalSettlement)
                  .Include(r => r.RentalSales)
                      .ThenInclude(rs => rs.SalesRepresentative)
                  .Include(r => r.RentalNotes)
                      .ThenInclude(rn => rn.AddedByEmployee)
                  .Where(r => r.RentalSales.Any(rs => rs.SalesRepresentativeId == EmployeeId))
                  .ToListAsync();

            var result = rentals.Select(r => new ReturnedRentalDto
            {
                Id = r.Id,
                UnitId = r.UnitId,
                OwnerId = r.OwnerId,
                PropertyId = r.PropertyId,

                StartDate = r.StartDate,
                EndDate = r.EndDate,

                DayPriceCustomer = r.DayPriceCustomer,
                DayPriceOwner = r.DayPriceOwner,

                CustomerDeposit = r.CustomerDeposit,
                CustomerOutstanding = r.RentalSettlement?.CustomerOutstanding ?? 0,
                OwnerDeposit = r.OwnerDeposit,
                OwnerRemaining = r.RentalSettlement?.OwnerRemaining ?? 0,
                SecurityDeposit = r.SecurityDeposit,

                TotalDays = r.EndDate.DayNumber - r.StartDate.DayNumber,
                TotalAmount = (r.EndDate.DayNumber - r.StartDate.DayNumber) * r.DayPriceCustomer,

                HasCampaignDiscount = r.HasCampaignDiscount,

                CustomerFullName = r.CustomerFullName,
                CustomerPhoneNumber = r.CustomerPhoneNumber,

                LastNote = r.RentalNotes?.OrderByDescending(n => n.CreatedAt).FirstOrDefault()?.Content,

                TotalCommision = r.RentalSettlement.SalesCommission ?? 0 , 
        

                Sales = r.RentalSales
                      .Where(rs => rs.SalesRepresentativeId == EmployeeId)
                      .Select(rs => new ReturnedRentalSalesDto
                      {
                          SalesRepresentativeId = rs.SalesRepresentativeId,
                          SalesRepName = rs.SalesRepresentative.UserName ?? "UNKNOWN",
                          Percentage = rs.CommissionPercentage,
                          CommissionAmount = rs.CommissionAmount
                      })
                      .ToList(),

                RentalNotes = r.RentalNotes?
                      .Select(rn => new ReturnedRentalNoteDto
                      {
                          Id = rn.Id,
                          Content = rn.Content,
                          CreatedAt = rn.CreatedAt,
                          AddedByEmployeeName = rn.AddedByEmployee?.UserName ?? "System"
                      })
                      .OrderByDescending(n => n.CreatedAt)
                      .ToList()

            }).ToList();
            return ApiResponse<List<ReturnedRentalDto>>.Success(result); 
        }
    }
}
