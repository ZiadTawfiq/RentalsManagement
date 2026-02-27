namespace RentalManagement.DTOs
{
    public class CommissionReportDto
    {
        public decimal TotalSalesCommission { get; set; }
        public decimal TotalCampaignAmount { get; set; }
        public int? PropertyId { get; set; }
        public int? UnitId { get; set; }
        public string? SalesRepId { get; set; }
        public List<DetailedCommissionDto> DetailedCommission { get; set; } = new();
    }
}
