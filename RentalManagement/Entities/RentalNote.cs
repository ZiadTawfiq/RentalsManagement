using System.ComponentModel.DataAnnotations;

namespace RentalManagement.Entities
{
    public class RentalNote
    {
        public int Id { get; set; }
        public int RentalId { get; set; }
        public Rental Rental { get; set; }

        [Required]
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Optional: track which employee added the note
        public string? AddedByEmployeeId { get; set; }
        public ApplicationUser? AddedByEmployee { get; set; }
    }
}
