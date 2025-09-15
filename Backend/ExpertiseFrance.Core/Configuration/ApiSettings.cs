namespace ExpertiseFrance.Core.Configuration
{
    public class ApiSettings
    {
        public string BaseUrl { get; set; } = string.Empty;
        public string Environment { get; set; } = "Development";
        public bool EnableSwagger { get; set; } = true;
        public bool EnableDetailedErrors { get; set; } = true;
        public string[] CorsOrigins { get; set; } = Array.Empty<string>();
    }
}
