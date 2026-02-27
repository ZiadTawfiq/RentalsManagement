using RentalManagement.Entities;
using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class CancelRentalDto
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public RentalStatus Status { get; set; }
        public string? CancellationReason { get; set; }
    }
}
