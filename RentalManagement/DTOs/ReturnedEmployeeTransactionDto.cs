using RentalManagement.Entities;
using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class ReturnedEmployeeTransactionDto
    {
        public int Id { get; set; }
        public int EmployeeFinancialAccountId { get; set; }
        
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EmployeeTransactionType Category { get; set; }
        
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public MoneyMovement Movement { get; set; }
        
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime Time { get; set; }
        public string? PerformedById { get; set; }
        public string? PerformedByUserName { get; set; }
    }
}
