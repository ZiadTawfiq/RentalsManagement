namespace RentalManagement.DTOs
{
    public class ReturnedEmployeeDto
    {
        public string UserName { get; set; }
        public int PropertyId { get; set; }
        public double? CachedTotalCommission { get; set; }
    }
}
