namespace RentalManagement.DTOs
{
    public class ChangePasswordDto
    {
        public string UserName { get; set; }
        public string NewPassword { get; set; }

        public string ConfirmPassword { get; set;  }

    }
}
