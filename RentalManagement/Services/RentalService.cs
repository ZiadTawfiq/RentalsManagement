using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;
using RentalManagement.Repositories;
using AutoMapper;

namespace RentalManagement.Services
{
    public class RentalService(ISystemSettingService _systemSetting, AppDbContext _context, IRentalRepository _rentalRepository, IMapper _mapper) : IRentalService
    {
        public async Task<ApiResponse< ReturnedRentalDto>> CreateRental(CreateRentalDto dto,string UserId)
        {
            if (dto.EndDate < dto.StartDate)
                throw new Exception("EndDate must be after StartDate");
            
            var Days = dto.EndDate.DayNumber - dto.StartDate.DayNumber;


            var Price_Customer = dto.DayPriceCustomer * Days;

            var ownerPaid = dto.OwnerDeposit;

            var Price_Owner = dto.DayPriceOwner * Days;

            var Oustanding_Customer = Price_Customer - dto.CustomerDeposit;
            
            var remainingOwner = Price_Owner - dto.OwnerDeposit;

            var totalCommision = Price_Customer - Price_Owner;

            decimal campainMoney = 0;


            if (dto.HasCampaignDiscount)
            {
                decimal CampainDiscountPercentage = await _systemSetting.GetCompainPercentage();

                decimal TC = totalCommision;
                totalCommision -= totalCommision *
                                            (CampainDiscountPercentage/ 100m);
                campainMoney = TC * (CampainDiscountPercentage / 100m);
            }


            var rental = new Rental()
            {
                CustomerDeposit = dto.CustomerDeposit,
                DayPriceCustomer = dto.DayPriceCustomer,
                DayPriceOwner = dto.DayPriceOwner,
                OwnerDeposit = dto.OwnerDeposit,
                HasCampaignDiscount = dto.HasCampaignDiscount,
                campainId = dto.CampainId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                SecurityDeposit = dto.SecurityDeposit,
                OwnerId = dto.OwnerId,
                UnitId = dto.UnitId,
                PropertyId = dto.PropertyId,
                CustomerFullName = dto.CustomerFullName,
                CustomerPhoneNumber = dto.CustomerPhoneNumber,
                ReservationTime = DateTime.Now,
                status = RentalStatus.Active
                


            };
            if (!string.IsNullOrEmpty(dto.Notes))
            {
                rental.RentalNotes.Add(new RentalNote
                {
                    Content = dto.Notes,
                    CreatedAt = DateTime.Now,
                    AddedByEmployeeId = UserId
                   
                    
                });
            }
            
            var commissionSum = 0m ; 
            foreach (var salesDto in dto.Sales)
            {
                commissionSum += salesDto.CommissionPercentage ?? 0;
                if (commissionSum > 100)
                    throw new Exception("Commission percentage cannot be greater than 100%"); 
                var commisionSales = (salesDto.CommissionPercentage) / 100 * totalCommision;
                rental.RentalSales.Add(new RentalSales
                {
                    SalesRepresentativeId = salesDto.SalesRepresentitiveId,
                    CommissionPercentage = salesDto.CommissionPercentage ?? 0,
                    CommissionAmount = commisionSales??0
                }
                );
            }
            rental.RentalSettlement = new RentalSettlement()
            {
                OwnerPaid = dto.OwnerDeposit,
                OwnerRemaining = remainingOwner,
                OwnerTotalAmount = Price_Owner,
                PaidByCustomer = dto.CustomerDeposit,
                CustomerOutstanding = Oustanding_Customer,
                TotalCustomerAmount = Price_Customer,
                SalesCommission = totalCommision,
                CalculatedAt = DateTime.Now,
                CampainMoney = campainMoney

            };

            await _context.Rentals.AddAsync(rental);
            await _context.SaveChangesAsync();
            await _context.Entry(rental)
                    .Collection(r => r.RentalSales)
                    .Query()
                    .Include(rs => rs.SalesRepresentative)
                    .LoadAsync();

            await _context.Entry(rental)
                .Collection(r => r.RentalNotes)
                .Query()
                .Include(_ => _.AddedByEmployee)
                .LoadAsync(); 
         

            return ApiResponse<ReturnedRentalDto>.Success(_mapper.Map<ReturnedRentalDto>(rental));
        }

        public async Task<ApiResponse<string>> DeleteRental(int Id)
        {
            return await _rentalRepository.DeleteRental(Id);
        }
   
        public async Task<ApiResponse<List<ReturnedRentalDto>>> FilterRental(RentalFilterDto dto)
        {
            var query = _context.Rentals
                .AsNoTracking();

            if (!string.IsNullOrEmpty(dto.SalesRepId))
            {
                query = query.Where(r =>
                    r.RentalSales.Any(rs => rs.SalesRepresentativeId == dto.SalesRepId));
            }

            if (dto.unitId.HasValue)
            {
                query = query.Where(r => r.UnitId == dto.unitId.Value);
            }

            if (dto.OwnerId.HasValue)
            {
                query = query.Where(r => r.OwnerId == dto.OwnerId.Value);
            }

            if (dto.PropertyId.HasValue)
            {
                query = query.Where(r => r.PropertyId == dto.PropertyId.Value);
            }

            if (dto.StartDate.HasValue)
            {
                query = query.Where(r => r.StartDate == dto.StartDate.Value);
            }
            if (dto.EndDate.HasValue)
            {
                query = query.Where(r => r.EndDate == dto.EndDate.Value);
            }

            var rentals = await query
                .Include(r => r.Unit)
                .Include(r => r.Owner)
                .Include(r => r.Property)
                .Include(r => r.RentalSettlement)
                .Include(r => r.RentalSales)
                    .ThenInclude(rs => rs.SalesRepresentative)
                .Include(r => r.RentalNotes)
                    .ThenInclude(rn => rn.AddedByEmployee)
                .ToListAsync();

            var result = _mapper.Map<List<ReturnedRentalDto>>(rentals);

            return ApiResponse<List<ReturnedRentalDto>>.Success(result);
        }

        public async Task<ApiResponse<List<ReturnedRentalDto>>> GetAllRentals()
        {
           return await _rentalRepository.GetAllRentals(); 
        }

    

        public async Task<ApiResponse<ReturnedRentalDto>> UpdateRental(UpdateRentalDto dto ,string UserId)
        {
    
            var rental = await _context.Rentals
                .Include(r => r.RentalNotes)
                .Include(r => r.RentalSales)
                .Include(r => r.RentalSettlement)
                .FirstOrDefaultAsync(r => r.Id == dto.RentalId);

            if (rental == null)
                throw new Exception("Rental not found");

            if (dto.EndDate < dto.StartDate)
                throw new Exception("EndDate must be after StartDate");

            if (rental.RentalSettlement == null)
            {
                rental.RentalSettlement = new RentalSettlement { RentalId = rental.Id };
            }
         
            var days =
                (dto.EndDate.DayNumber - dto.StartDate.DayNumber) ;

            var priceCustomer = dto.DayPriceCustomer * days;
            var priceOwner = dto.DayPriceOwner * days;

            var ownerPaid = dto.OwnerDeposit;
            var remainingOwner = priceOwner - ownerPaid;

            var outstandingCustomer =
                priceCustomer - dto.CustomerDeposit;

            var totalCommision = priceCustomer - priceOwner;

            decimal campaignMoney = 0;
          

            if (dto.HasCampaignDiscount)
            {

                var campaignPercentage =
                 await _systemSetting.GetCompainPercentage();
                campaignMoney =
                    totalCommision *
                    (campaignPercentage / 100m);

                totalCommision -= campaignMoney;
            }

            rental.StartDate = dto.StartDate;
            rental.EndDate = dto.EndDate;

            rental.DayPriceCustomer = dto.DayPriceCustomer;
            rental.DayPriceOwner = dto.DayPriceOwner;

            rental.CustomerDeposit = dto.CustomerDeposit;
            rental.OwnerDeposit = dto.OwnerDeposit;
            rental.SecurityDeposit = dto.SecurityDeposit;

            rental.HasCampaignDiscount = dto.HasCampaignDiscount;
            rental.campainId = dto.CampainId;

            rental.OwnerId = dto.OwnerId;
            rental.UnitId = dto.UnitId;
            rental.PropertyId = dto.PropertyId;

            rental.CustomerFullName = dto.CustomerFullName;
            rental.CustomerPhoneNumber = dto.CustomerPhoneNumber;

            if (!string.IsNullOrEmpty(dto.Notes))
            {
                rental.RentalNotes.Add(new RentalNote
                {
                    Content = dto.Notes,
                    CreatedAt = DateTime.UtcNow,
                    AddedByEmployeeId = UserId
                    
                });
            }

        
            rental.RentalSales.Clear();
            var commissionSum = 0m;
            foreach (var salesDto in dto.Sales)
            {
                commissionSum += salesDto.CommissionPercentage ?? 0;
                if(commissionSum > 100)
                    throw new Exception("Commission percentage cannot be greater than 100%");
                var commissionAmount =
                    totalCommision *
                    (salesDto.CommissionPercentage / 100m);
                rental.RentalSales.Add(new RentalSales
                {
                    SalesRepresentativeId = salesDto.SalesRepresentitiveId,
                    CommissionPercentage = salesDto.CommissionPercentage??0,
                    CommissionAmount = commissionAmount??0
                });
            }

        
            rental.RentalSettlement.OwnerPaid = ownerPaid;
            rental.RentalSettlement.OwnerRemaining = remainingOwner;
            rental.RentalSettlement.OwnerTotalAmount = priceOwner;

            rental.RentalSettlement.PaidByCustomer = dto.CustomerDeposit;
            rental.RentalSettlement.CustomerOutstanding = outstandingCustomer;
            rental.RentalSettlement.TotalCustomerAmount = priceCustomer;

            rental.RentalSettlement.SalesCommission = totalCommision;
            rental.RentalSettlement.CampainMoney = campaignMoney;
            rental.RentalSettlement.CalculatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            await _context.Entry(rental)
                .Collection(_ => _.RentalSales)
                .Query()
                .Include(_ => _.SalesRepresentative)
                .ToListAsync(); 
         
            return ApiResponse<ReturnedRentalDto>.Success(_mapper.Map<ReturnedRentalDto>(rental));
        }

        public async Task<ApiResponse<ReturnedRentalNoteDto>> AddRentalNote(int rentalId, string content, string? employeeId)
        {
            var rental = await _context.Rentals.FindAsync(rentalId);
            if (rental == null) return ApiResponse<ReturnedRentalNoteDto>.Failure("Rental not found");

            var note = new RentalNote
            {
                RentalId = rentalId,
                Content = content,
                AddedByEmployeeId = employeeId,
                CreatedAt = DateTime.Now
            };

            await _context.RentalNotes.AddAsync(note);
            await _context.SaveChangesAsync();

            if (employeeId != null)
            {
                await _context.Entry(note).Reference(n => n.AddedByEmployee).LoadAsync();
            }

            return ApiResponse<ReturnedRentalNoteDto>.Success(new ReturnedRentalNoteDto
            {
                Id = note.Id,
                Content = note.Content,
                CreatedAt = note.CreatedAt,
                AddedByEmployeeName = note.AddedByEmployee?.UserName ?? "System"
            });
        }

        public async Task<ApiResponse<List<ReturnedRentalDto>>> ViewRentalsForEmployeeById(string EmployeeId)
        {
            return await _rentalRepository.ViewRentalsForEmployeeById(EmployeeId); 
        }

       

        public async Task<ApiResponse<string>> CancelRental(int rentalId, RentalStatus rentalStatus, string? cancellationReason)
        {
            var res = await _context.RentalSales
                 .Include(_ => _.SalesRepresentative)
                 .Where(_ => _.RentalId == rentalId)
                 .ToListAsync();

            var rental = await _context.Rentals
                .Include(_ =>_.RentalSettlement)
                .FirstOrDefaultAsync(_ => _.Id == rentalId);

            if (rental == null)
            {
                return ApiResponse<string>.Failure("No Rental is Found!"); 
            }
            

            if (rental.status == RentalStatus.Cancelled)
            {
                return ApiResponse<string>.Failure("Rental has already cancelled!");
            }
            var campainDiscount =await _systemSetting.GetCompainPercentage();
            using var transaction =await _context.Database.BeginTransactionAsync();
            if (rentalStatus == RentalStatus.Cancelled)
            {
                foreach (var item in res)
                {
                    if (item.SalesRepresentative != null)
                    {
                        item.CommissionAmount = 0;
                        item.CommissionPercentage = 0;
                    }

                }
                rental.RentalSettlement.CampainMoney = 0;
                rental.RentalSettlement.SalesCommission = 0;

                rental.status = RentalStatus.Cancelled;
            }
            else if (rentalStatus == RentalStatus.EarlyCheckout)
            {
                
                var today = DateOnly.FromDateTime(DateTime.Now);

                if (today < rental.EndDate)
                {
                    rental.CheckoutDate = today;
                    var totalDays = (rental.EndDate.DayNumber - rental.StartDate.DayNumber);
                    var usedDays = (today.DayNumber - rental.StartDate.DayNumber) + 1;

                    if (totalDays <= 0) totalDays = 1; // Avoid division by zero
                    if (usedDays < 0) usedDays = 0;
                    if (usedDays > totalDays) usedDays = totalDays;

                    var pricePerDayCustomer = rental.DayPriceCustomer;
                    var pricePerDayOwner = rental.DayPriceOwner;

                    var usedAmountCustomer = pricePerDayCustomer * usedDays;
                    var usedAmountOwner = pricePerDayOwner * usedDays;

                    var commissionForUsedDays = usedAmountCustomer - usedAmountOwner;

                    if (rental.HasCampaignDiscount)
                    {
                        if (rental.RentalSettlement == null)
                        {
                            return ApiResponse<string>.Failure("RentalSettlement is not found!");
                        }
                        decimal campaignPercentage = await _systemSetting.GetCompainPercentage();
                        rental.RentalSettlement.CampainMoney = (campaignPercentage / 100m) * commissionForUsedDays;
                        commissionForUsedDays -= rental.RentalSettlement.CampainMoney ?? 0m;
                    }

                    // Update Settlement records to reflect actual stay
                    rental.RentalSettlement.TotalCustomerAmount = usedAmountCustomer;
                    rental.RentalSettlement.OwnerTotalAmount = usedAmountOwner;
                    rental.RentalSettlement.SalesCommission = commissionForUsedDays;
                    rental.RentalSettlement.CalculatedAt = DateTime.Now;

                    // Update Sales records
                    foreach (var item in res)
                    {
                        if (item.SalesRepresentative == null) continue;
                        item.CommissionAmount = (item.CommissionPercentage / 100m) * commissionForUsedDays;
                    }
                    
                    rental.status = RentalStatus.EarlyCheckout;
                    rental.CancellationReason = cancellationReason;
                }
            }
            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return ApiResponse<string>.Success("Status of Rental Changed Succefully");

        }

        public async Task<ApiResponse<bool>> CompleteRental(int rentalId)
        {
            var today = DateOnly.FromDateTime(DateTime.Now); 
            var rental = await _context.Rentals
                 .FirstOrDefaultAsync(_ => _.Id == rentalId);
            if (rental == null)
                return ApiResponse<bool>.Failure("No Rental is found");

            if (rental.status != RentalStatus.Active)
                return ApiResponse<bool>.Failure("Rental is not Active!");

            if (today < rental.EndDate)
                return ApiResponse<bool>.Failure("Rental period has not ended yet.");

            rental.status = RentalStatus.Completed;
            await _context.SaveChangesAsync();
            return ApiResponse<bool>.Success(true); 
                
        }
    }
}
