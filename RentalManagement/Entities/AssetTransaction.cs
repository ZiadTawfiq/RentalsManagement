using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace RentalManagement.Entities
{
    public class AssetTransaction
    {
        public int Id { get; set; }

        public int AssetId { get; set; }
        [ForeignKey("AssetId")]
        public Asset Asset { get; set; } = null!;

        public int QuantityChanged { get; set; } // +ive for add, -ive for remove

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public AssetTransactionType Type { get; set; }

        public string? Description { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public string? PerformedById { get; set; }
        [ForeignKey("PerformedById")]
        public ApplicationUser? PerformedBy { get; set; }
    }

    public enum AssetTransactionType
    {
        Addition = 1,
        Removal = 2,
        Correction = 3
    }
}
