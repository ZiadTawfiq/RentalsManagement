using RentalManagement.DTOs;

namespace RentalManagement.Services
{
    public interface IRentalServices
    {
        Task<string> CreateRental(CreateRentalDto dto);
        //Task<RentalDto>
    }
}
