using RentalManagement.Entities;
using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class FinancialTransactionDto
    {
        public int Id { get; set; }
        public int FinancialAccountId { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TransactionType TransactionType { get; set; }
        public string? Notes { get; set; }
        public decimal Amount { get; set; }
        public DateTime Time { get; set; }
        public string? Description { get; set; }

        // ── Rental context (populated only when linked to a rental) ──────────
        public int? RentalId { get; set; }
        public string? PropertyName { get; set; }
        public string? UnitCode { get; set; }
        public string? OwnerName { get; set; }
        public string? ClientName { get; set; }
        public string? ClientPhone { get; set; }
        public List<SalesEntryDto> Sales { get; set; } = [];

        public string? DepositHolder { get; set; }
    }

    public class SalesEntryDto
    {
        public string SalesRepName { get; set; } = string.Empty;
        public decimal Percentage { get; set; }
    }
}
