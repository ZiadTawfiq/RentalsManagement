
namespace RentalManagement.Entities
{
    public class Rental
    {
        public int Id { get; set; }

        public string SalesRepresentativeId { get; set; }
        public ApplicationUser SalesRepresentative { get; set; }

        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }

        public decimal BasePrice { get; set; }
        public decimal NetPrice { get; set; }

        public bool HasCampaignDiscount { get; set; }
        public decimal CampaignPercentage { get; set; }

        public string? CustomerFullName { get; set; }
        public string CustomerPhoneNumber { get; set; }

    }
}
