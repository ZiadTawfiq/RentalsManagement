using RentalManagement.Entities;

namespace RentalManagement.DTOs
{
    public class ReturnedEmployeeAccountDto
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public decimal Salary { get; set; }
        public decimal CommissionBalance { get; set; }
        public decimal BonusBalance { get; set; }
        public decimal LoanBalance { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class EmployeeTransactionDto
    {
        public int EmployeeAccountId { get; set; }
        public EmployeeTransactionType Category { get; set; }
        public MoneyMovement Movement { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
    }

    public class ReturnedEmployeeTransactionDto
    {
        public int Id { get; set; }
        public int EmployeeAccountId { get; set; }
        public EmployeeTransactionType Category { get; set; }
        public MoneyMovement Movement { get; set; }
        public decimal Amount { get; set; }
        public string? Description { get; set; }
        public DateTime Time { get; set; }
        public string PerformedByUserName { get; set; }
    }
}
