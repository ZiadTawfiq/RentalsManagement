using RentalManagement.Entities;
using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class UpdateFinancialAccountDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public AccountType Type { get; set; }
        public decimal? Balance { get; set; }
    }
}
