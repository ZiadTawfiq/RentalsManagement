using RentalManagement.Entities;
using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class RefundSecurityDepositDto
    {
        public int FromAccountId { get; set; }
        public decimal Amount { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public SecurityFundHolder holder { get; set; }


    }
}
