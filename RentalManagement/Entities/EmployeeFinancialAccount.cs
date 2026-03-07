using System.ComponentModel.DataAnnotations.Schema;

namespace RentalManagement.Entities
{
    public class EmployeeFinancialAccount
    {
        public int Id { get; set; }
        
        public string UserId { get; set; }
        [ForeignKey("UserId")]
        public ApplicationUser User { get; set; }

        public decimal SalaryForCurrentMonth { get; set; } 
        public decimal BaseMonthlySalary { get; set; }  
        public decimal RemainingMonthlySalary { get; set; }
        public decimal CommissionBalance { get; set; } 
        public decimal RemainingCommission { get; set; }
        public decimal TotalBonusBalance { get; set; }
        public decimal RemainingBonusBalance { get; set; }
        public decimal LoanBalance { get; set; }

        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }
}
