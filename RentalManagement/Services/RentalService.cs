using Microsoft.EntityFrameworkCore;
using RentalManagement.DTOs;
using RentalManagement.Entities;
using RentalManagement.Repositories;
using System.Runtime.InteropServices.Marshalling;
using System.Security.Claims;

namespace RentalManagement.Services
{
    public class RentalService(ISystemSettingService _systemSetting, AppDbContext _context, IRentalRepository _rentalRepository) : IRentalService
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
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                SecurityDeposit = dto.SecurityDeposit,
                OwnerId = dto.OwnerId,
                UnitId = dto.UnitId,
                PropertyId = dto.PropertyId,
                CustomerFullName = dto.CustomerFullName,
                CustomerPhoneNumber = dto.CustomerPhoneNumber,
                ReservationTime = DateTime.Now


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
         

            return ApiResponse<ReturnedRentalDto>.Success(new ReturnedRentalDto
            {
                Id = rental.Id,
                UnitId = rental.UnitId,
                OwnerId = rental.OwnerId,
                PropertyId = rental.PropertyId,

                StartDate = rental.StartDate,
                EndDate = rental.EndDate,

                DayPriceCustomer = rental.DayPriceCustomer,
                DayPriceOwner = rental.DayPriceOwner,

                HasCampaignDiscount = rental.HasCampaignDiscount,

                CustomerFullName = rental.CustomerFullName,
                CustomerPhoneNumber = rental.CustomerPhoneNumber,
                Sales = rental.RentalSales
                .Select(rs => new ReturnedRentalSalesDto
                {
                    SalesRepresentativeId = rs.SalesRepresentativeId,
                    SalesRepName = rs.SalesRepresentative.UserName,
                    Percentage = rs.CommissionPercentage,
                    CommissionAmount = rs.CommissionAmount
                }).ToList(),

                CustomerDeposit = rental.CustomerDeposit,
                CustomerOutstanding = rental.RentalSettlement?.CustomerOutstanding ?? 0,
                OwnerDeposit = rental.OwnerDeposit,
                OwnerRemaining = rental.RentalSettlement?.OwnerRemaining ?? 0,
                SecurityDeposit = rental.SecurityDeposit,

                TotalDays = (rental.EndDate.DayNumber - rental.StartDate.DayNumber),
                TotalAmount = (rental.EndDate.DayNumber - rental.StartDate.DayNumber) * rental.DayPriceCustomer,
                TotalCommision = totalCommision,
                
                LastNote = dto.Notes,
                RentalNotes = rental.RentalNotes?.Select(rn => new ReturnedRentalNoteDto
                {
                    Id = rn.Id,
                    Content = rn.Content,
                    CreatedAt = rn.CreatedAt,
                    AddedByEmployeeName = rn.AddedByEmployee?.UserName
                }).ToList() ?? new List<ReturnedRentalNoteDto>()
            });
        }

        public async Task<ApiResponse<string>> DeleteRental(int Id)
        {
            return await _rentalRepository.DeleteRental(Id);
        }

        public async Task<ApiResponse<List<ReturnedRentalDto>>> FilterRental(RentalFilterDto dto)
        {
            var Query = _context.Rentals
               .Include(_ => _.RentalSettlement)
               .Include(_ => _.RentalSales)
               .ThenInclude(_ => _.SalesRepresentative)
               .AsQueryable(); 
            if (!string.IsNullOrEmpty(dto.SalesRepId))
            {
                Query = Query.Where(_ => _.RentalSales.Any(_ => _.SalesRepresentativeId == dto.SalesRepId)); 
                
            }
            if (dto.unitId.HasValue)
            {
                Query = Query.Where(_ => _.UnitId == dto.unitId); 
            }
            if (dto.OwnerId.HasValue)
            {
                Query = Query.Where(_ => _.OwnerId == dto.OwnerId); 
            }
            if (dto.PropertyId.HasValue)
            {
                Query = Query.Where(_ => _.PropertyId == dto.PropertyId); 
            }
            var rentals = await Query.ToListAsync();

            var result = rentals
                 .Select(r => r.ToReturnedDto())
                 .ToList();

            return ApiResponse<List<ReturnedRentalDto>>.Success(result);
        }

        public async Task<ApiResponse<List<ReturnedRentalDto>>> GetAllRentals()
        {
           return await _rentalRepository.GetAllRentals(); 
        }

        public async Task<ApiResponse<decimal>> GetCampainCommission()
        {
            var commision  = await _context.RentalSettlements
                 .SumAsync(_ => _.CampainMoney ?? 0) ;
            return ApiResponse<decimal>.Success(commision);

        }

        public async Task<ApiResponse<decimal>> GetCommissionForSalesRep(string Id)
        {
            var commission = await _context.RentalSales
                .Where(_ => _.SalesRepresentativeId == Id)
                .SumAsync(_ => _.CommissionAmount );
            return ApiResponse<decimal>.Success(commission);
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
         
            return ApiResponse<ReturnedRentalDto>.Success(new ReturnedRentalDto
            {
                Id = rental.Id,
                UnitId = rental.UnitId,
                OwnerId = rental.OwnerId,
                PropertyId = rental.PropertyId,

                StartDate = rental.StartDate,
                EndDate = rental.EndDate,

                DayPriceCustomer = rental.DayPriceCustomer,
                DayPriceOwner = rental.DayPriceOwner,

                HasCampaignDiscount = rental.HasCampaignDiscount,

                CustomerFullName = rental.CustomerFullName,
                CustomerPhoneNumber = rental.CustomerPhoneNumber,
               

                Sales = rental.RentalSales
                .Select(rs => new ReturnedRentalSalesDto
                {
                    SalesRepresentativeId = rs.SalesRepresentativeId,
                    SalesRepName = rs.SalesRepresentative.UserName,
                    Percentage = rs.CommissionPercentage,
                    CommissionAmount = rs.CommissionAmount
                }).ToList(),

                CustomerDeposit = rental.CustomerDeposit,
                CustomerOutstanding = rental.RentalSettlement?.CustomerOutstanding ?? 0,
                OwnerDeposit = rental.OwnerDeposit,
                OwnerRemaining = rental.RentalSettlement?.OwnerRemaining ?? 0,
                SecurityDeposit = rental.SecurityDeposit,

                TotalDays = (rental.EndDate.DayNumber - rental.StartDate.DayNumber),
                TotalAmount = (rental.EndDate.DayNumber - rental.StartDate.DayNumber) * rental.DayPriceCustomer,
                TotalCommision = totalCommision,
                
                LastNote = dto.Notes,
                RentalNotes = rental.RentalNotes?.Select(rn => new ReturnedRentalNoteDto
                {
                    Id = rn.Id,
                    Content = rn.Content,
                    CreatedAt = rn.CreatedAt,
                    AddedByEmployeeName = rn.AddedByEmployee?.UserName ?? "System"
                }).ToList() ?? new List<ReturnedRentalNoteDto>()
            });
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

            // Load employee name for return DTO
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

        public async Task<ApiResponse<string>> CancelRental(int rentalId,RentalStatus rentalStatus)
        {
            var res = await _context.RentalSales
                 .Include(_ => _.SalesRepresentative)
                 .Where(_ => _.RentalId == rentalId)
                 .ToListAsync();

            var rental = await _context.Rentals
                .FirstOrDefaultAsync(_ => _.Id == rentalId) ?? new Rental();


            if (rentalStatus == RentalStatus.Cancelled)
            {
                foreach (var item in res)
                {

                    item.SalesRepresentative.CachedTotalCommission -= item.CommissionAmount;

                }
                rental.status = RentalStatus.Cancelled; 
            }
            else if (rentalStatus == RentalStatus.EarlyCheckout)
            {
                    var leftDay = DateTime.Now.Day;
                    var endDate = rental.EndDate;
                    var startDate = rental.StartDate;

                    var diffLeftStartDay = leftDay - startDate.DayNumber;
                    var diffendStart = endDate.DayNumber - startDate.DayNumber;

                    var diffDays = diffendStart - diffLeftStartDay;


                    var commissionDiscounted = diffDays * rental.DayPriceCustomer;

                foreach (var item in res)
                {
                    item.SalesRepresentative.CachedTotalCommission -= commissionDiscounted;


                }
                rental.status = RentalStatus.EarlyCheckout; 

            }

                return ApiResponse<string>.Success("Status of Rental Changed Succefully"); 

        }
    }
}
