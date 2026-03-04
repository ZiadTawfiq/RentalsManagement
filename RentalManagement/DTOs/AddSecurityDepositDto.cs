using RentalManagement.Entities;
using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class AddSecurityDepositDto
    {
        public int ToAccountId { get; set; }
        public decimal Amount { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public SecurityFundHolder Holder { get; set; }
    }
}
