import { parsePhoneNumber, validatePhoneNumberLength } from 'libphonenumber-js/max';

// Simulates the validatePhone function from validation.js
function validatePhone(value) {
    if (!value) return "Phone number is required";
    const lengthError = validatePhoneNumberLength(value);
    if (lengthError) {
        switch (lengthError) {
            case 'TOO_SHORT': return "Number is incomplete/too short";
            case 'TOO_LONG': return "Number is too long";
            case 'INVALID_COUNTRY': return "Invalid country code";
            case 'NOT_A_NUMBER': return "Invalid number format";
            default: return "Invalid phone number";
        }
    }
    try {
        const parsed = parsePhoneNumber(value);
        if (!parsed.isValid()) return "Invalid phone number for the selected country";
        if (!parsed.getType()) return "Number is incomplete or not a valid mobile/landline number";
    } catch {
        return "Invalid phone number";
    }
    return true;
}

// Simulates PhoneInput stripping leading zero
function buildPhoneValue(dialCode, localInput) {
    const digits = localInput.replace(/\D/g, '');
    const stripped = digits.replace(/^0+/, ''); // Strip leading zero
    return dialCode + stripped;
}

const tests = [
    // [dialCode, localInput, description]
    ['+20', '0127979355', 'Egypt mobile with leading 0 (user types 0127979355)'],
    ['+20', '127979355', 'Egypt mobile without leading 0'],
    ['+20', '1012345678', 'Egypt Vodafone mobile'],
    ['+20', '12797935', 'Egypt incomplete (8 digits)'],
    ['+966', '512345678', 'Saudi mobile (valid)'],
    ['+966', '54444444', 'Saudi incomplete (8 digits)'],
    ['+1', '2025551234', 'US number'],
];

console.log('=== Phone Validation Test ===\n');
for (const [dialCode, local, desc] of tests) {
    const combined = buildPhoneValue(dialCode, local);
    const result = validatePhone(combined);
    const status = result === true ? '✅ ALLOWED' : `❌ BLOCKED: ${result}`;
    console.log(`${desc}`);
    console.log(`  Input: ${dialCode} + "${local}" → "${combined}"`);
    console.log(`  Result: ${status}\n`);
}
