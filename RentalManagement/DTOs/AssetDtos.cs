using System.ComponentModel.DataAnnotations;

namespace RentalManagement.DTOs
{
    public class AssetDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; } // This is the "Comment"
        [Required]
        public int Quantity { get; set; }
    }

    public class ReturnedAssetDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Quantity { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class AssetQuantityChangeDto
    {
        public int AssetId { get; set; }
        [Required]
        public int Amount { get; set; } // +ive for add, -ive for remove
        public string? Description { get; set; }
    }

    public class ReturnedAssetTransactionDto
    {
        public int Id { get; set; }
        public int AssetId { get; set; }
        public string AssetName { get; set; } = string.Empty;
        public int QuantityChanged { get; set; }
        public string Type { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public string? PerformedByUserName { get; set; }
    }
}
