using RentalManagement.Entities;
using System.Text.Json.Serialization;
namespace RentalManagement.DTOs
{
  

    public class EmployeeTransactionDto
    {
        public int FromAccountId { get; set; }
        public int EmployeeAccountId { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EmployeeTransactionType Category { get; set; }
        
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public MoneyMovement Movement { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }

    public class AddEarningsDto
    {
        public int EmployeeAccountId { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EmployeeTransactionType Category { get; set; } 
        public decimal Amount { get; set; }
    }
}
