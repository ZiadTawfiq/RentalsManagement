using System.ComponentModel.DataAnnotations;

namespace RentalManagement.Entities
{
    public class ExternalAccount
    {
        public int Id { get; set; }
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public ICollection<ExternalTransaction> Transactions { get; set; } = new List<ExternalTransaction>();
    }
}
