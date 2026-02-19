using PhoneNumbers;

namespace RentalManagement.Helpers
{
    public static class PhoneHelper
    {
        private static readonly PhoneNumberUtil Util = PhoneNumberUtil.GetInstance();

        /// <summary>
        /// Validates a phone number. Defaults to Egypt (EG) if no country code is provided.
        /// </summary>
        public static bool IsValid(string phone, string defaultRegion = "EG")
        {
            if (string.IsNullOrWhiteSpace(phone))
                return false;

            try
            {
                var mobileNumber = Util.Parse(phone, defaultRegion);
                return Util.IsValidNumber(mobileNumber);
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Normalizes a phone number to E.164 format (e.g., +201012345678).
        /// </summary>
        public static string Normalize(string phone, string defaultRegion = "EG")
        {
            if (string.IsNullOrWhiteSpace(phone))
                return phone;

            try
            {
                var mobileNumber = Util.Parse(phone, defaultRegion);
                if (Util.IsValidNumber(mobileNumber))
                {
                    return Util.Format(mobileNumber, PhoneNumberFormat.E164);
                }
            }
            catch
            {
                // Return original if parsing fails
            }

            return phone;
        }
    }
}
