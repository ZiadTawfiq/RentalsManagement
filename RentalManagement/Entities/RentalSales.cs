namespace RentalManagement.Entities
{
    public class RentalSales
    {
        public int RentalId { get; set; }
        public Rental Rental { get; set; }

        public string SalesRepresentativeId { get; set; }
        public ApplicationUser SalesRepresentative { get; set; }

        // Commission snapshot
        public decimal CommissionPercentage { get; set; }
        public decimal CommissionAmount { get; set; }

    }
}
