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
    }
}
