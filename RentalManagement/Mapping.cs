using AutoMapper;
using RentalManagement.DTOs;
using RentalManagement.Entities;

namespace RentalManagement
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<ApplicationUser, ReturnedEmployeeDto>(); 
        }
    }
}
