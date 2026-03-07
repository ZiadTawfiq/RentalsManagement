namespace RentalManagement.DTOs
{
    public class ExternalAccountDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class ExternalTransactionDto
    {
        public int ExternalAccountId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "EGP";
        public string Type { get; set; } = "Debit"; // Debit/Credit
        public string? Description { get; set; }
    }

    public class ReturnedExternalAccountDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<CurrencyBalanceDto> Balances { get; set; } = new();
    }

    public class CurrencyBalanceDto
    {
        public string Currency { get; set; } = string.Empty;
        public decimal TotalBalance { get; set; } // Positive means they owe us (Credit > Debit), Negative means we owe them (Debit > Credit)
    }

    public class ReturnedExternalTransactionDto
    {
        public int Id { get; set; }
        public int ExternalAccountId { get; set; }
        public string ExternalAccountName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime Date { get; set; }
        public string? ProofImagePath { get; set; }
        public string? PerformedByUserName { get; set; }
    }
}
