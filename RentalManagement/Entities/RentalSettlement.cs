public class RentalSettlement
{
    public int Id { get; set; }

    public int RentalId { get; set; }
    public Rental Rental { get; set; }

    // Customer
    public decimal TotalCustomerAmount { get; set; }
    public decimal PaidByCustomer { get; set; }
    public decimal CustomerOutstanding { get; set; }

    // Owner
    public decimal OwnerTotalAmount { get; set; }
    public decimal OwnerPaid { get; set; }
    public decimal OwnerRemaining { get; set; }

    // Company
    public decimal CompanyRevenue { get; set; }

    // Sales
    public decimal? SalesCommission { get; set; }

    public DateTime CalculatedAt { get; set; }

}
