namespace RentalManagement.DTOs
{
    public class DetailedCommissionDto
    {
        public string UnitCode { get; set; } = "";
        public string PropertyName { get; set; } = "";
        public string StartDate { get; set; } = "";
        public string EndDate { get; set; } = "";
        public decimal SalesCommission { get; set; }
        public decimal CampaignCommission { get; set; }
    }
}
