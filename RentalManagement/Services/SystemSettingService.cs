

using Microsoft.EntityFrameworkCore;
using RentalManagement.Entities;

namespace RentalManagement.Services
{
    public class SystemSettingService(AppDbContext _context) : ISystemSettingService
    {
        public async Task<decimal> GetCompainPercentage()
        {
            var campainPercentage = await _context.SystemSettings.AsNoTracking().FirstOrDefaultAsync();

            if (campainPercentage == null)
            {
                return 0; 
            }

            return campainPercentage.CampaignDiscountPercentage;
        }

        public Task<decimal> GetCompainPercentage(int percentage)
        {
            throw new NotImplementedException();
        }

        public async Task MakeCampainPercentage(int percentage)
        {
            var campPer = new SystemSetting()
            {
                CampaignDiscountPercentage = percentage,
                UpdatedAt = DateTime.UtcNow,
            };
            await _context.SystemSettings.AddAsync(campPer);
            await _context.SaveChangesAsync(); 
        }

      

        public async Task UpdateCampainPercentage(int Percentage)
        {
            var campainPercentage = await _context.SystemSettings.FirstOrDefaultAsync(); 
            if (campainPercentage == null)
            {
                return;
            }
            else
            {
                campainPercentage.CampaignDiscountPercentage = Percentage;
                campainPercentage.UpdatedAt = DateTime.Now;
            }
            await _context.SaveChangesAsync(); 
        }
    }
}
