namespace RentalManagement.Services
{
    public interface ICacheService
    {
        Task<T> GetOrSet<T>(string k, Func<Task<T>> factory);
        Task Remove(string k); 
    }
}
