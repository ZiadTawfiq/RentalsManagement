namespace RentalManagement.DTOs
{
    public class UpdateEmployeeDto
    {
        public string UserName { get; set; }
        public string PhoneNumber { get; set; }
        public int PropertyId { get; set; }
        public List<string> Roles { get; set; }
    }
}
