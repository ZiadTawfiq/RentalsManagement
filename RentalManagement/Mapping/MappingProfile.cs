using AutoMapper;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<ApplicationUser, ReturnedEmployeeDto>()
                .ForMember(d => d.PropertyName, opt => opt.MapFrom(s => s.Property != null ? s.Property.Name : "N/A"));

            CreateMap<UpdateEmployeeDto, ApplicationUser>(); 

            CreateMap<Owner, ReturnedOwnerDto>();

            CreateMap<OwnerDto, Owner>();

            CreateMap<Property, ReturnedPropertyDto>();

            CreateMap<PropertyDto, Property>();

            CreateMap<UnitDto, Unit>();

            CreateMap<Unit, ReturnedUnitDto>()
                .ForMember(d => d.OwnerName, opt => opt.MapFrom(s => s.Owner != null ? s.Owner.Name : "N/A"))
                .ForMember(d => d.PropertyName, opt => opt.MapFrom(s => s.Property != null ? s.Property.Name : "N/A"));

            CreateMap<RentalSales, ReturnedRentalSalesDto>()
                .ForMember(d => d.SalesRepName, opt => opt.MapFrom(s => s.SalesRepresentative != null ? s.SalesRepresentative.UserName : "UNKNOWN"))
                .ForMember(d => d.Percentage, opt => opt.MapFrom(s => s.CommissionPercentage));

            CreateMap<RentalNote, ReturnedRentalNoteDto>()
                .ForMember(d => d.AddedByEmployeeName, opt => opt.MapFrom(s => s.AddedByEmployee != null ? s.AddedByEmployee.UserName : "System"));

            CreateMap<Rental, ReturnedRentalDto>()
                .ForMember(d => d.UnitCode, opt => opt.MapFrom(s => s.Unit != null ? s.Unit.Code : "N/A"))
                .ForMember(d => d.OwnerName, opt => opt.MapFrom(s => s.Owner != null ? s.Owner.Name : "N/A"))
                .ForMember(d => d.OwnerPhoneNumber, opt => opt.MapFrom(s => s.Owner != null ? s.Owner.PhoneNumber : "N/A"))
                .ForMember(d => d.PropertyName, opt => opt.MapFrom(s => s.Property != null ? s.Property.Name : "N/A"))
                .ForMember(d => d.CustomerOutstanding, opt => opt.MapFrom(s => s.RentalSettlement != null ? s.RentalSettlement.CustomerOutstanding : 0))
                .ForMember(d => d.OwnerRemaining, opt => opt.MapFrom(s => s.RentalSettlement != null ? s.RentalSettlement.OwnerRemaining : 0))
                .ForMember(d => d.TotalCommision, opt => opt.MapFrom(s => s.RentalSettlement != null ? s.RentalSettlement.SalesCommission : 0))
                .ForMember(d => d.CampainMoney, opt => opt.MapFrom(s => s.RentalSettlement != null ? s.RentalSettlement.CampainMoney : 0))
                .ForMember(d => d.CampainId, opt => opt.MapFrom(s => s.campainId))
                .ForMember(d => d.Status, opt => opt.MapFrom(s => s.status))
                .ForMember(d => d.TotalDays, opt => opt.MapFrom(s => (s.status == RentalStatus.EarlyCheckout && s.CheckoutDate.HasValue)
                    ? (s.CheckoutDate.Value.DayNumber - s.StartDate.DayNumber + 1)
                    : (s.EndDate.DayNumber - s.StartDate.DayNumber)))
                .ForMember(d => d.TotalAmount, opt => opt.MapFrom(s => s.RentalSettlement != null
                    ? s.RentalSettlement.TotalCustomerAmount
                    : (s.EndDate.DayNumber - s.StartDate.DayNumber) * s.DayPriceCustomer))
                .ForMember(d => d.Sales, opt => opt.MapFrom(s => s.RentalSales))
                .ForMember(d => d.RentalNotes, opt => opt.MapFrom(s => s.RentalNotes != null ? s.RentalNotes.OrderByDescending(n => n.CreatedAt).ToList() : new List<RentalNote>()))
                .ForMember(d => d.LastNote, opt => opt.MapFrom(s => s.RentalNotes != null ? s.RentalNotes.OrderByDescending(n => n.CreatedAt).FirstOrDefault().Content : null));

            CreateMap<EmployeeFinancialAccount, ReturnedEmployeeAccountDto>()
                .ForMember(d => d.UserName, opt => opt.MapFrom(s => s.User != null ? s.User.UserName : "UNKNOWN"))
                .ForMember(d => d.BaseMonthlySalary, opt => opt.MapFrom(s => s.BaseMonthlySalary))
                .ForMember(d => d.RemainingMonthlySalary, opt => opt.MapFrom(s => s.RemainingMonthlySalary))
                .ForMember(d => d.TotalBonusBalance, opt => opt.MapFrom(s => s.TotalBonusBalance))
                .ForMember(d => d.RemainingBonusBalance, opt => opt.MapFrom(s => s.RemainingBonusBalance))
                .ForMember(d => d.BonusBalance, opt => opt.MapFrom(s => s.TotalBonusBalance)); // For backward compatibility

            CreateMap<EmployeeTransaction, ReturnedEmployeeTransactionDto>()
                .ForMember(d => d.PerformedByUserName, opt => opt.MapFrom(s => s.PerformedBy != null ? s.PerformedBy.UserName : "System"))
                .ForMember(d => d.Movement, opt => opt.MapFrom(s => s.Type == TransactionType.Deposit ? MoneyMovement.Deposit : MoneyMovement.Withdraw));

            CreateMap<EarningsHistory, ReturnedEarningsHistoryDto>()
                .ForMember(d => d.PerformedByUserName, opt => opt.MapFrom(s => s.PerformedBy != null ? s.PerformedBy.UserName : "System"));

            CreateMap<Asset, ReturnedAssetDto>();
            CreateMap<AssetDto, Asset>();

            CreateMap<AssetTransaction, ReturnedAssetTransactionDto>()
                .ForMember(d => d.AssetName, opt => opt.MapFrom(s => s.Asset != null ? s.Asset.Name : "N/A"))
                .ForMember(d => d.PerformedByUserName, opt => opt.MapFrom(s => s.PerformedBy != null ? s.PerformedBy.UserName : "System"));

            CreateMap<ExternalAccountDto, ExternalAccount>();
            CreateMap<ExternalAccount, ReturnedExternalAccountDto>()
                .ForMember(dest => dest.Balances, opt => opt.Ignore());
            CreateMap<ExternalTransactionDto, ExternalTransaction>();
            CreateMap<ExternalTransaction, ReturnedExternalTransactionDto>()
                .ForMember(dest => dest.ExternalAccountName, opt => opt.MapFrom(src => src.ExternalAccount != null ? src.ExternalAccount.Name : ""))
                .ForMember(dest => dest.PerformedByUserName, opt => opt.MapFrom(src => src.PerformedBy != null ? src.PerformedBy.UserName : "System"));

        }
    }
}
