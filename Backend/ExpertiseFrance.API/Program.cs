using ExpertiseFrance.Core.Interfaces.Repositories;
using ExpertiseFrance.Core.Interfaces.Services;
using ExpertiseFrance.Infrastructure.Repositories;
using ExpertiseFrance.Infrastructure.Services;
using ExpertiseFrance.Core.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Configure settings based on environment
var apiSettings = new ApiSettings();
builder.Configuration.GetSection("ApiSettings").Bind(apiSettings);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add Swagger only in Development or when explicitly enabled
if (apiSettings.EnableSwagger)
{
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title = "ExpertiseFrance API",
            Version = "v1",
            Description = "API for Projects, CAD Data, and MIP Data",
        });
    });
}

// Configure HTTPS redirection based on environment
if (builder.Environment.IsProduction())
{
    builder.Services.AddHttpsRedirection(options =>
    {
        options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
        options.HttpsPort = 443;
    });
}
else
{
    builder.Services.AddHttpsRedirection(options =>
    {
        options.RedirectStatusCode = StatusCodes.Status307TemporaryRedirect;
        options.HttpsPort = 5151;
    });
}

// Register Repository dependencies
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ICADDataRepository, CADDataRepository>();
builder.Services.AddScoped<IMIPDataRepository, MIPDataRepository>();

// Register Service dependencies
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ICADDataService, CADDataService>();
builder.Services.AddScoped<IMIPDataService, MIPDataService>();
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));
// Configure CORS based on environment
builder.Services.AddCors(options =>
{
    options.AddPolicy("ApiCorsPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(apiSettings.CorsOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline based on environment
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    
    if (apiSettings.EnableSwagger)
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "ExpertiseFrance API v1");
            c.RoutePrefix = "swagger";
        });
    }
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseCors("ApiCorsPolicy");
app.UseAuthorization();
app.MapControllers();
app.MapReverseProxy();
// Log startup info
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Starting ExpertiseFrance API in {Environment} environment", app.Environment.EnvironmentName);

app.Run();
