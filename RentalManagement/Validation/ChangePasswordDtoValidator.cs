using FluentValidation;
using RentalManagement.DTOs;

public class ChangePasswordDtoValidator : AbstractValidator<ChangePasswordDto>
{
    public ChangePasswordDtoValidator()
    {
        RuleFor(_ => _.UserName)
            .NotEmpty();

        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .MinimumLength(6)
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$")
            .WithMessage("Password must contain upper, lower case letters, a number, and a special character like @");


        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.NewPassword)
            .WithMessage("Passwords do not match");

    }
}
