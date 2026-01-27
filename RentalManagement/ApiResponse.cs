namespace RentalManagement
{
    public class ApiResponse<T>
    {
        public bool IsSuccess { get; set;  }
        public T Data { get; set; }

        public static ApiResponse<T> Success(T data)
        {
            return new ApiResponse<T> 
            { 
                IsSuccess = true,
                Data = data 
            };
        }
        public static ApiResponse<T> Failure()
        {
            return new ApiResponse<T>
            {
                IsSuccess = false,
                Data = default
            };
        }
    }
}
