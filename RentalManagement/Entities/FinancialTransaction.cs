using System.Text.Json.Serialization;

namespace RentalManagement.Entities
{
    public class FinancialTransaction
    {
        public int Id { get; set;  }
        public int FinancialAccountId { get; set;  }
        
        public FinancialAccount FinancialAccount { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public TransactionType TransactionType { get; set;  }
        public string? Description { get; set;  }
        public int? RentalId { get; set; }
        public Rental? Rental { get; set; }
        public string ?Notes { get; set;  }
        public decimal Amount { get; set; }
        public DateTime Time { get; set;  }

    }
}
