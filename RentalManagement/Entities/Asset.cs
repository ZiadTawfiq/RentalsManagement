using System.ComponentModel.DataAnnotations;

namespace RentalManagement.Entities
{
    public class Asset
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int Quantity { get; set; } = 0;

        public DateTime LastUpdated { get; set; } = DateTime.Now;

        public ICollection<AssetTransaction> Transactions { get; set; } = new List<AssetTransaction>();
    }
}
