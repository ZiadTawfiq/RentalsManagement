using FluentValidation;
using RentalManagement.DTOs;

namespace RentalManagement.Validation
{
    public class LoginDtoValidator:AbstractValidator<LoginDto>
    {
        public LoginDtoValidator()
        {
            RuleFor(_ => _.UserName)
                .NotEmpty()
                .WithMessage("UserName is Required");
            
            RuleFor(x => x.Password)
           .NotEmpty().WithMessage("Password is required");
        }
    }
}
