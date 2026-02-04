using FluentValidation;
using RentalManagement.DTOs;
using System.Text.RegularExpressions;

public class OwnerDtoValidator : AbstractValidator<OwnerDto>
{
    public OwnerDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(3)
            .WithMessage("Name at least 3 chars!");


        RuleFor(x => x.PhoneNumber)
            .Must(BeValidPhone)
            .NotEmpty()
            .WithMessage("Invalid PhoneNumber!");

    }
    private bool BeValidPhone(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;

        phone = phone.Trim()
                     .Replace(" ", "")
                     .Replace("-", "")
                     .Replace("(", "")
                     .Replace(")", "")
                     .Replace("_", "");

        var international = Regex.IsMatch(phone, @"^\+[1-9]\d{7,14}$");
        var egypt = Regex.IsMatch(phone, @"^(?:\+20|0)?1[0125]\d{8}$");
        return international || egypt;
    }
}
