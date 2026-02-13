namespace RentalManagement.Services
{
    public interface ISystemSettingService
    {
        Task MakeCampainPercentage(int percentage);
        Task <decimal> GetCompainPercentage();
        Task UpdateCampainPercentage(int Percentage); 
    }
}
