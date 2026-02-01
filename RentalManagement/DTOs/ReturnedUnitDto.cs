namespace RentalManagement.DTOs
{
    public class ReturnedUnitDto
    {
        public int Id { get; set; }
        public string Code { get; set; }

        public int OwnerId { get; set; }
        public string OwnerName { get; set; }

        public int PropertyId { get; set; }
        public string PropertyName { get; set; }
    }



}
