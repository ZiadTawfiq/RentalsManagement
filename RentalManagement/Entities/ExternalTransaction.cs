using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentalManagement.Entities
{
    public class ExternalTransaction
    {
        public int Id { get; set; }
        
        [Required]
        public int ExternalAccountId { get; set; }
        [ForeignKey("ExternalAccountId")]
        public ExternalAccount? ExternalAccount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(10)]
        public string Currency { get; set; } = "EGP"; // USD, EGP, etc.

        [Required]
        [StringLength(20)]
        public string Type { get; set; } = "Debit"; // Debit (we owe them), Credit (they owe us)

        public string? Description { get; set; }
        public DateTime Date { get; set; } = DateTime.Now;

        public string? ProofImagePath { get; set; }

        public string? PerformedById { get; set; }
        [ForeignKey("PerformedById")]
        public ApplicationUser? PerformedBy { get; set; }
    }
}
