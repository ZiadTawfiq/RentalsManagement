using FluentValidation;
using PhoneNumbers;
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

        var util = PhoneNumberUtil.GetInstance();

        var mobileNumber = util.Parse(phone, null);
        try {
            return util.IsValidNumber(mobileNumber);

        }
        catch
        {
            return false; 
        }        
    }
}
