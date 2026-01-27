namespace RentalManagement.Entities
{
    public class SystemSetting
    {
        public int Id { get; set; }
        public decimal CampaignDiscountPercentage { get; set; } // مثال: 25
        public DateTime UpdatedAt { get; set; }
    }
}
