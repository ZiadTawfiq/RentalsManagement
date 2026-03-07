using System.Text.Json.Serialization;

namespace RentalManagement.Entities
{
    public class EarningsHistory
    {
        public int Id { get; set; }
        public int EmployeeFinancialAccountId { get; set; }
        public EmployeeFinancialAccount EmployeeFinancialAccount { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EmployeeTransactionType Category { get; set; }

        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime Time { get; set; } = DateTime.Now;
        public string? PerformedById { get; set; }
        public ApplicationUser? PerformedBy { get; set; }
    }
}
