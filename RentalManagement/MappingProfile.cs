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

            CreateMap<UpdateEmployeeDto, ApplicationUser>(); 

            CreateMap<Owner, ReturnedOwnerDto>();

            CreateMap<OwnerDto, Owner>();

            CreateMap<Property, ReturnedPropertyDto>();

            CreateMap<PropertyDto, Property>();

            CreateMap<UnitDto, Unit>();

            CreateMap<Unit, ReturnedUnitDto>()
                .ForMember(d => d.OwnerName, opt => opt.MapFrom(s => s.Owner.Name))
                .ForMember(d => d.PropertyName, opt => opt.MapFrom(s => s.Property.Name));

        }
    }
}
