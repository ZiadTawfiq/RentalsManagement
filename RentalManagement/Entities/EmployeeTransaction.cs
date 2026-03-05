using System.Text.Json.Serialization;

namespace RentalManagement.Entities
{
    public enum EmployeeTransactionType
    {
        Salary = 1,
        Commission = 2,
        Bonus = 3,
        Loan = 4,
        Custom = 5
    }

    public enum MoneyMovement
    {
        Deposit = 1,
        Withdraw = 2
    }

    public class EmployeeTransaction
    {
        public int Id { get; set; }
        public int EmployeeFinancialAccountId { get; set; }
        public EmployeeFinancialAccount EmployeeFinancialAccount { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EmployeeTransactionType Category { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public MoneyMovement Movement { get; set; }

        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime Time { get; set; } = DateTime.Now;
        public string? PerformedById { get; set; }
        public ApplicationUser? PerformedBy { get; set; }
    }
}
