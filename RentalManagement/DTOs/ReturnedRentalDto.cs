using RentalManagement.Controllers;

namespace RentalManagement.DTOs
{
    public class ReturnedRentalDto
    {
        public int Id { get; set; }
        public int UnitId { get; set; }
        public string UnitCode { get; set; }
        public int OwnerId { get; set; }
        public string OwnerName { get; set; }
        public int PropertyId { get; set; }
        public string PropertyName { get; set; }

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }

        public decimal DayPriceCustomer { get; set; }
        public decimal DayPriceOwner { get; set; }

        public decimal CustomerDeposit { get; set; }
        public decimal? OwnerDeposit { get; set; }
        public decimal? SecurityDeposit { get; set; }

        public int TotalDays { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal CustomerOutstanding { get; set; }
        public decimal OwnerRemaining { get; set; }

        public bool HasCampaignDiscount { get; set; }

        public string CustomerFullName { get; set; }
        public string CustomerPhoneNumber { get; set; }
        public decimal TotalCommision { get; set; }

        public List<ReturnedRentalSalesDto> Sales { get; set; }
        public List<ReturnedRentalNoteDto> RentalNotes { get; set; } = new List<ReturnedRentalNoteDto>();
        public string? LastNote { get; set; }

    }
}
