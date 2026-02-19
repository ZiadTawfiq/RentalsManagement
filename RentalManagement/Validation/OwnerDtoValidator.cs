using FluentValidation;
using RentalManagement.DTOs;
using RentalManagement.Helpers;

public class OwnerDtoValidator : AbstractValidator<OwnerDto>
{
    public OwnerDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(3)
            .WithMessage("Name at least 3 chars!");


        RuleFor(x => x.PhoneNumber)
            .Must(phone => PhoneHelper.IsValid(phone))
            .NotEmpty()
            .WithMessage("Invalid PhoneNumber!");

    }
}
