using FluentValidation;
using RentalManagement.DTOs;

public class SignupDtoValidator : AbstractValidator<SignupDto>
{
    public SignupDtoValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .MinimumLength(3);

        RuleFor(x => x.PhoneNumber)
        .NotEmpty()
        .Matches(@"^(?:\+?[1-9]\d{6,14}|01[0-2,5][0-9]{8})$")
        .WithMessage("Phone number must be Egyptian or international");

        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(6);

        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.Password)
            .WithMessage("Passwords do not match");

        RuleFor(x => x.Roles)
            .NotEmpty()
            .WithMessage("At least one role is required");
    }
}
