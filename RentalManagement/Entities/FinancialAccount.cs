using System.Text.Json.Serialization;

namespace RentalManagement.Entities
{
    public class FinancialAccount
    {
        public int Id { get; set; }
        public string Name { get; set;  }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public AccountType accountType { get; set;  }
        public decimal Balance { get; set;  }
    }
}
