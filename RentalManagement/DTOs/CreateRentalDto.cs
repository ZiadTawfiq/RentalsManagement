namespace RentalManagement.DTOs
{
    public class CreateRentalDto
    {
        public int UnitId { get; set; }
        public int OwnerId { get; set; }
        public int PropertyId { get; set; }

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }

        public decimal DayPriceCustomer { get; set; }
        public decimal DayPriceOwner { get; set; }

        public decimal CustomerDeposit { get; set; }
        public decimal OwnerDeposit { get; set;  }
        public decimal? SecurityDeposit { get; set; }

        public bool HasCampaignDiscount { get; set; }

        public string CustomerFullName { get; set; }
        public string CustomerPhoneNumber { get; set; }

        public List<CreateRentalSalesDto> Sales { get; set; }
        public string? Notes { get; set; }
    }

}
