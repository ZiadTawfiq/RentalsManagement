import { parsePhoneNumber, validatePhoneNumberLength } from 'libphonenumber-js/max';

export const validatePhone = (value) => {
    if (!value) return "Phone number is required";

    // Step 1: Check length errors first (gives specific messages)
    const lengthError = validatePhoneNumberLength(value);
    if (lengthError) {
        switch (lengthError) {
            case 'TOO_SHORT':
                return "Number is incomplete/too short";
            case 'TOO_LONG':
                return "Number is too long";
            case 'INVALID_COUNTRY':
                return "Invalid country code";
            case 'NOT_A_NUMBER':
                return "Invalid number format";
            default:
                return "Invalid phone number";
        }
    }

    // Step 2: Parse and strictly validate using full metadata (/max)
    try {
        const parsed = parsePhoneNumber(value);
        // isValid() with /max metadata is strict and checks real number patterns
        if (!parsed.isValid()) {
            return "Invalid phone number for the selected country";
        }
        // getType() returns undefined for unrecognized patterns (e.g. fake/incomplete numbers)
        if (!parsed.getType()) {
            return "Number is incomplete or not a valid mobile/landline number";
        }
    } catch {
        return "Invalid phone number";
    }

    return true;
};
