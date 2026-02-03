using RentalManagement.Entities;

public class Rental
{
    public int Id { get; set; }

    // Sales
    public string SalesRepresentativeId { get; set; }
    public ApplicationUser SalesRepresentative { get; set; }

    // Dates
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }

    // Prices snapshot
    public decimal DayPriceCustomer { get; set; }
    public decimal DayPriceOwner { get; set; }

    //public decimal BasePrice { get; set; }
    //public decimal NetPrice { get; set; }

    // Payments (FACTS)
    public decimal CustomerDeposit { get; set; }     // اللي العميل دفعه
    public decimal? OwnerDeposit { get; set; }        // اللي المالك استلمه فعليًا
    public decimal? SecurityDeposit { get; set; } // يرد بعد الاستلام

    // Campaign
    public bool HasCampaignDiscount { get; set; }

    // Customer
    public string? CustomerFullName { get; set; }
    public string CustomerPhoneNumber { get; set; }

    // Relations
    public int PropertyId { get; set; }
    public Property Property { get; set; }

    public int OwnerId { get; set; }
    public Owner Owner { get; set; }

    public int UnitId { get; set; }
    public Unit Unit { get; set; }

    // Meta
    public DateTime ReservationTime { get; set; }
    public string? Notes { get; set; }

    public ICollection<RentalSales> RentalSales { get; set; } = new List<RentalSales>();
    public RentalSettlement RentalSettlement { get; set; }


}
