namespace RentalManagement.Entities
{
    public class Property
    {
        public int Id { get; set;  }
        public string Name { get; set; }
        public ICollection<Unit> Units { get; set; } = new List<Unit>();
    }
}
