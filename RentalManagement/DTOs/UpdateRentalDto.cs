using System.ComponentModel.DataAnnotations;

namespace RentalManagement.DTOs
{
    public class UpdateRentalDto : CreateRentalDto
    {
        public int RentalId { get; set;  }
        
        [Required]
        public new string Notes { get; set;  }
    }
}
