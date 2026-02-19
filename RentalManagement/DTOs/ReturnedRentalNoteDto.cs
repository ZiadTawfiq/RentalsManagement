namespace RentalManagement.DTOs
{
    public class ReturnedRentalNoteDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? AddedByEmployeeName { get; set; }
    }
}
