namespace RentalManagement.Entities
{
    public class Unit
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public int OwnerId { get; set; }
        public Owner Owner { get; set; }
        public int PropertyId { get; set; }
        public Property Property { get; set; }

        public ICollection<Rental> Rentals { get; set; }
    }
}
