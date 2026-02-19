namespace RentalManagement.DTOs
{
    public class ReturnedEmployeeDto
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new();
        public int PropertyId { get; set; }
        public string PropertyName { get; set; } = string.Empty;
        public decimal? CachedTotalCommission { get; set; }
    }
}
