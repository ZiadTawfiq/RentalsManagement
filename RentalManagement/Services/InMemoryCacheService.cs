
using Microsoft.Extensions.Caching.Memory;

namespace RentalManagement.Services
{
    public class InMeomoryCacheService(IMemoryCache _memoryCache) : ICacheService
    {

        public async Task<T> GetOrSet<T>(string k, Func<Task<T>> factory)
        {
            if (!_memoryCache.TryGetValue(k , out T value))
            {
                value = await factory();

                var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(1))
                    .SetAbsoluteExpiration(TimeSpan.FromHours(1))
                    .SetPriority(CacheItemPriority.Normal);

                _memoryCache.Set(k, value, cacheEntryOptions);
            }
            return value;
        }

        public Task Remove(string k)
        {
            throw new NotImplementedException();
        }
    }
}
