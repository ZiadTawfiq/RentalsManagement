using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;

using AutoMapper;

namespace RentalManagement.Repositories
{
    public class RentalRepository(AppDbContext _context, IMapper _mapper) : IRentalRepository
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

            var result = _mapper.Map<List<ReturnedRentalDto>>(rentals);
            return ApiResponse<List<ReturnedRentalDto>>.Success(result);
        }


        public async Task<ApiResponse<List<ReturnedRentalDto>>> ViewRentalsForEmployeeById(string EmployeeId)
        {
            var rentals = await _context.Rentals
                  .Include(r => r.RentalSettlement)
                  .Include(r => r.Unit)
                  .Include(r => r.Owner)
                  .Include(r => r.Property)
                  .Include(r => r.RentalSales)
                      .ThenInclude(rs => rs.SalesRepresentative)
                  .Include(r => r.RentalNotes)
                      .ThenInclude(rn => rn.AddedByEmployee)
                  .Where(r => r.RentalSales.Any(rs => rs.SalesRepresentativeId == EmployeeId))
                  .ToListAsync();

            var result = _mapper.Map<List<ReturnedRentalDto>>(rentals);
            return ApiResponse<List<ReturnedRentalDto>>.Success(result); 
        }
    }
}
