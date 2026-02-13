using RentalManagement.DTOs;

public static class RentalMappingExtensions
{
    public static ReturnedRentalDto ToReturnedDto(
        this Rental rental)
  {
        return new ReturnedRentalDto
        {
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
                    SalesRepName = rs.SalesRepresentative.UserName,
                    Percentage = rs.CommissionPercentage,
                    CommissionAmount = rs.CommissionAmount
                }).ToList(),
            Notes = rental.Notes
        };
    }
}
