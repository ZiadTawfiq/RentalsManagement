namespace RentalManagement
{
    public class ApiResponse<T>
    {
        public bool IsSuccess { get; set;  }
        public T Data { get; set; }
        public string Message { get; set; }

        public static ApiResponse<T> Success(T data)
        {
            return new ApiResponse<T> 
            { 
                IsSuccess = true,
                Data = data 
            };
        }
        public static ApiResponse<T> Failure(string message)
        {
            return new ApiResponse<T>
            {
                IsSuccess = false,
                Data = default,
                Message = message
            };
        }
    }
}
