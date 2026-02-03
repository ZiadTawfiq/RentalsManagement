using FluentValidation;
using RentalManagement.DTOs;

public class OwnerDtoValidator : AbstractValidator<OwnerDto>
{
    public OwnerDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(3);

        RuleFor(x => x.PhoneNumber)
            .NotEmpty();
    }
}
