using System.Diagnostics;

namespace RentalManagement.Middleware
{
    public class ProfilingMiddleware
    {
        private readonly RequestDelegate next;
        private readonly ILogger<ProfilingMiddleware> _logger; 
        public ProfilingMiddleware(RequestDelegate _delegate , ILogger<ProfilingMiddleware>logger)
        {
             next  = _delegate;
            _logger = logger; 
        }
        public async Task InvokeAsync(HttpContext _context)
        {
            var stopWatch = new Stopwatch();
            stopWatch.Start();

            await next(_context);

            stopWatch.Stop();

            _logger.LogInformation($"The Request to {_context.Request.Path} has took '{stopWatch.ElapsedMilliseconds}'ms to be implemented"); 


        }

    }
}
