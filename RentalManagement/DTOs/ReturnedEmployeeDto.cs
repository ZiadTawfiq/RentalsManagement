namespace RentalManagement.DTOs
{
    public class ReturnedEmployeeDto
    {
        public string Name { get; set; }
        public int PropertyId { get; set; }
        public double ? TotalCommission { get; set; }
    }
}
