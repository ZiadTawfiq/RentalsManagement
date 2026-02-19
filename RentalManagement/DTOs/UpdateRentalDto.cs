namespace RentalManagement.DTOs
{
    public class UpdateRentalDto : CreateRentalDto
    {
        public int RentalId { get; set;  }
        
        public new string? Notes { get; set;  }
    }
}
