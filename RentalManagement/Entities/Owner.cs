namespace RentalManagement.Entities
{
    public class Owner
    {
        public int Id { get; set;  }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
        public ICollection<Unit> Units { get; set; } = new List<Unit>(); 

    }
}
