using RentalManagement.DTOs;

public static class RentalMappingExtensions
{
    public static ReturnedRentalDto ToReturnedDto(
        this Rental rental)
  {
        return new ReturnedRentalDto
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
                    SalesRepName = rs.SalesRepresentative?.UserName ?? "UNKNOWN",
                    Percentage = rs.CommissionPercentage,
                    CommissionAmount = rs.CommissionAmount
                }).ToList(),
            CustomerDeposit = rental.CustomerDeposit,
            CustomerOutstanding = rental.RentalSettlement?.CustomerOutstanding ?? 0,
            OwnerDeposit = rental.OwnerDeposit,
            OwnerRemaining = rental.RentalSettlement?.OwnerRemaining ?? 0,
            SecurityDeposit = rental.SecurityDeposit,
            RentalNotes = rental.RentalNotes?.Select(rn => new ReturnedRentalNoteDto
            {
                Id = rn.Id,
                Content = rn.Content,
                CreatedAt = rn.CreatedAt,
                AddedByEmployeeName = rn.AddedByEmployee?.UserName ?? "System"
            }).ToList() ?? new List<ReturnedRentalNoteDto>(),
            LastNote = rental.RentalNotes?.OrderByDescending(n => n.CreatedAt).FirstOrDefault()?.Content
        };
    }
}
