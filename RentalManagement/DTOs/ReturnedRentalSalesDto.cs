namespace RentalManagement.DTOs
{
    public class ReturnedRentalSalesDto
    {
        public string SalesRepresentativeId { get; set; }
        public string SalesRepName { get; set;  }
        public decimal Percentage { get; set; }
        public decimal CommissionAmount { get; set;  }
    }
}
