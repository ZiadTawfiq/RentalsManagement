namespace RentalManagement.DTOs
{
    public class SignupDto
    {
        public string UserName { get; set;  }
        public string PhoneNumber { get; set; }
        public int PropertyId { get; set;  }
        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
        public List<string> Roles { get; set; }
    }
}
