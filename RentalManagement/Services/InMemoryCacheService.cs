
using Microsoft.Extensions.Caching.Memory;

namespace RentalManagement.Services
{
    public class InMeomoryCacheService(IMemoryCache _memoryCache) : ICacheService
    {

        public async Task<T> GetOrSet<T>(string k, Func<Task<T>> factory,TimeSpan AbsExpiration)
        {
            if (!_memoryCache.TryGetValue(k , out T value))
            {
                value = await factory();

                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(AbsExpiration);

                _memoryCache.Set(k, value, cacheEntryOptions);
            }
            return value;
        }

        public void Remove(string k)
        {
            _memoryCache.Remove(k);
        }
    }
}
