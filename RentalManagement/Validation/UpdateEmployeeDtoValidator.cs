using FluentValidation;
using RentalManagement.DTOs;

public class UpdateEmployeeDtoValidator : AbstractValidator<UpdateEmployeeDto>
{
    public UpdateEmployeeDtoValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .MinimumLength(3);

        RuleFor(x => x.PhoneNumber)
            .NotEmpty();

        RuleFor(x => x.PropertyId)
            .GreaterThan(0);

        RuleForEach(x => x.Roles)
            .NotEmpty();
    }
}
