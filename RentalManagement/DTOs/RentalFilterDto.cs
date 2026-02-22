namespace RentalManagement.DTOs
{
    public class RentalFilterDto
    {
        public int? PropertyId { get; set; }
        public int? OwnerId { get; set; }
        public int? unitId { get; set; } 
        public string? SalesRepId { get; set;  }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
    }
}
