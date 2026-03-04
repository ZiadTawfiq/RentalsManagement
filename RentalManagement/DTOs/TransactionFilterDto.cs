using RentalManagement.Entities;
using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class TransactionFilterDto
    {
        public int? FinancialTransactionId { get; set;  }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TransactionType? TransactionType { get; set; }
        public DateOnly? Time { get; set; }
    }
}
