using System.Text.Json.Serialization;

namespace RentalManagement.DTOs
{
    public class ReturnedEmployeeAccountDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        [JsonPropertyName("salary")]
        public decimal Salary { get; set; }
        [JsonPropertyName("salaryForCurrentMonth")]
        public decimal SalaryForCurrentMonth { get; set; } 
        [JsonPropertyName("baseMonthlySalary")]
        public decimal BaseMonthlySalary { get; set; }  
        [JsonPropertyName("remainingMonthlySalary")]
        public decimal RemainingMonthlySalary { get; set; }
        [JsonPropertyName("commissionBalance")]
        public decimal CommissionBalance { get; set; } 
        [JsonPropertyName("remainingCommission")]
        public decimal RemainingCommission { get; set; }
        [JsonPropertyName("totalBonusBalance")]
        public decimal TotalBonusBalance { get; set; }
        [JsonPropertyName("remainingBonusBalance")]
        public decimal RemainingBonusBalance { get; set; }
        [JsonPropertyName("bonusBalance")]
        public decimal BonusBalance { get; set; }
        public decimal LoanBalance { get; set; }
        public DateTime LastUpdated { get; set; }
    }
}
