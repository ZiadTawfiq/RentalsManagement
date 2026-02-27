using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class CommissionFilterDto
    {
        [JsonPropertyName("salesId")]
        public string? SalesId { get; set; }

        [JsonPropertyName("propertyId")]
        public int? PropertyId { get; set; }

        [JsonPropertyName("unitId")]
        public int? unitId { get; set; }
    }
}
