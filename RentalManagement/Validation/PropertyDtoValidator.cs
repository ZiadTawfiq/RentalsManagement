using FluentValidation;
using RentalManagement.DTOs;

public class PropertyDtoValidator : AbstractValidator<PropertyDto>
{
    public PropertyDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(3);
    }
}
