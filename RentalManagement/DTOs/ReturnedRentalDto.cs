using RentalManagement.Controllers;

namespace RentalManagement.DTOs
{
    public class ReturnedRentalDto
    {
        public int UnitId { get; set; }
        public int OwnerId { get; set; }
        public int PropertyId { get; set; }

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }

        public decimal DayPriceCustomer { get; set; }
        public decimal DayPriceOwner { get; set; }

        public bool HasCampaignDiscount { get; set; }

        public string CustomerFullName { get; set; }
        public string CustomerPhoneNumber { get; set; }
        public decimal TotalCommision { get; set; }

        public List<ReturnedRentalSalesDto> Sales { get; set; }
        public string? Notes { get; set; }

    }
}
