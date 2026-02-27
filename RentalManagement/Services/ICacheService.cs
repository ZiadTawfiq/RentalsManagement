namespace RentalManagement.Services
{
    public interface ICacheService
    {
        Task<T> GetOrSet<T>(string k, Func<Task<T>> factory, TimeSpan timeSpan);
        void Remove(string k); 
    }
}
