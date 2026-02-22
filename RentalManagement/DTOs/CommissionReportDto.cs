namespace RentalManagement.DTOs
{
    public class CommissionReportDto
    {
        public decimal TotalCommision { get; set; }
        public int?PropetyId { get; set;  }
        public int? UnitId { get; set;  }
        public string? SalesRepId { get; set; }
    }
}
