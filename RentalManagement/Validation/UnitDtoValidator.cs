using FluentValidation;
using RentalManagement.DTOs;

public class UnitDtoValidator : AbstractValidator<UnitDto>
{
    public UnitDtoValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty();

        RuleFor(x => x.OwnerId)
            .GreaterThan(0);

        RuleFor(x => x.PropertyId)
            .GreaterThan(0);
    }
}
