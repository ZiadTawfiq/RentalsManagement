using FluentValidation;
using RentalManagement.DTOs;
using RentalManagement.Helpers;

public class SignupDtoValidator : AbstractValidator<SignupDto>
{
    public SignupDtoValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .MinimumLength(3);

        RuleFor(x => x.PhoneNumber)
            .Must(phone => PhoneHelper.IsValid(phone))
            .NotEmpty()
            .WithMessage("Phone number must be a valid number (e.g., Egyptian 010... or international with +)");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6)
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$")
            .WithMessage("Password must contain upper, lower case letters, a number, and a special character like @");


        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password)
            .WithMessage("Passwords do not match");

        RuleFor(x => x.Roles)
            .NotEmpty()
            .WithMessage("At least one role is required");
    }
}
