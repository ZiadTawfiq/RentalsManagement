using RentalManagement.Entities;
using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class PayRentDto
    {
        public int ToAccountId { get; set; }
        public int FromAccountId { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TransactionType Transaction { get; set; }
        public decimal Amount { get; set; }
    }
}
