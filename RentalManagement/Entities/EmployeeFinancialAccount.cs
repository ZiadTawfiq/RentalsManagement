using System.ComponentModel.DataAnnotations.Schema;

namespace RentalManagement.Entities
{
    public class EmployeeFinancialAccount
    {
        public int Id { get; set; }
        
        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        public decimal Salary { get; set; } = 0;
        public decimal BaseMonthlySalary { get; set; } = 0; // The fixed salary amount per month
        public decimal CommissionBalance { get; set; } = 0;
        public decimal BonusBalance { get; set; } = 0;
        public decimal LoanBalance { get; set; } = 0;

        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }
}
