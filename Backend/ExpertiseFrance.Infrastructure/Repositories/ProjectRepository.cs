using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Dapper;
using ExpertiseFrance.Core.Models;
using ExpertiseFrance.Core.Interfaces.Repositories;

namespace ExpertiseFrance.Infrastructure.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly string? _connectionString;

        public ProjectRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<IEnumerable<Project>> GetAllProjectsAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            // Simple query without ORDER BY to avoid column name issues
            var query = "SELECT * FROM PROJECTS";
            return await connection.QueryAsync<Project>(query);
        }
         public async Task<IEnumerable<TopCountryData>> GetAllCadCategory()
        {
            using var connection = new SqlConnection(_connectionString);
            // Simple query without ORDER BY to avoid column name issues
            var query = "SELECT DISTINCT CATEGORY FROM CAD";
            return await connection.QueryAsync<TopCountryData>(query);
        }

        public async Task<Project?> GetProjectByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM PROJECTS WHERE ID = @Id";
            return await connection.QueryFirstOrDefaultAsync<Project>(query, new { Id = id });
        }

        public async Task<Project?> GetProjectByGuidAsync(Guid guid)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM PROJECTS WHERE PROJECTGUID = @Guid";
            return await connection.QueryFirstOrDefaultAsync<Project>(query, new { Guid = guid });
        }

        public async Task<IEnumerable<Project>> GetProjectsByCountryAsync(string country)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM PROJECTS WHERE COUNTRY = @Country";
            return await connection.QueryAsync<Project>(query, new { Country = country });
        }

        public async Task<IEnumerable<Project>> GetProjectsByYearAsync(int year)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM PROJECTS WHERE YEAR = @Year";
            return await connection.QueryAsync<Project>(query, new { Year = year });
        }
        public async Task<CountryChartDataResponse> GetSection2ChartsDataAsync()
        {
            using var connection = new SqlConnection(_connectionString);

            // Query for MIP (Engage) data
            var engageQuery = "EXEC sp_GetProjectsChartDataAllCountriesAllRanges";

            // Query for Projects (Projected) data  
            var projectedQuery = "EXEC [dbo].[sp_GetMIPChartDataAllCountriesAllRanges]";

            var cadQuery = "EXEC GET_CHART2_TOP_CAD_DATA";
            var actionQuery = "EXEC sp_GetChart3DataAllCountriesAllRanges";

            // Execute both queries
            var engageData = await connection.QueryAsync<ChartDataItem>(engageQuery);
            var projectedData = await connection.QueryAsync<ChartDataItem>(projectedQuery);
            var cadData = await connection.QueryAsync<ProjectCadData>(cadQuery);
            var actionData = await connection.QueryAsync<ActionData>(actionQuery);

            return new CountryChartDataResponse
            {
                Engage = engageData.ToList(),
                Projected = projectedData.ToList(),
                CadDataChart2 = cadData.ToList(),
                ActionDataChart3 = actionData.ToList()

                //         Engage = engageData.FirstOrDefault() != null ? new List<ChartDataItem> { engageData.FirstOrDefault() } : new List<ChartDataItem>(),
                // Projected = projectedData.FirstOrDefault() != null ? new List<ChartDataItem> { projectedData.FirstOrDefault() } : new List<ChartDataItem>(),
                // CadDataChart2 = cadData.FirstOrDefault() != null ? new List<ProjectCadData> { cadData.FirstOrDefault() } : new List<ProjectCadData>(),
                // ActionDataChart3 = actionData.FirstOrDefault() != null ? new List<ActionData> { actionData.FirstOrDefault() } : new List<ActionData>()

            };
        }
      public async Task<Section3ChartsDataResponse> GetSection3ChartsDataAsync(string yearRange = null, string category = null)
{
    using var connection = new SqlConnection(_connectionString);

    try
    {
        var response = new Section3ChartsDataResponse();

        // Prepare parameters
        var parameters = new DynamicParameters();
        if (!string.IsNullOrEmpty(yearRange))
            parameters.Add("@YearRang", yearRange);
        if (!string.IsNullOrEmpty(category))
            parameters.Add("@Category", category);

        // Execute Top Countries query
        var topCountriesData = await connection.QueryAsync<TopCountryData>(
            "EXEC SP_GET_TOP_COUNTRIES_DATA_BY_CAD @YearRang, @Category", 
            parameters
        );
        response.TopCountries = topCountriesData.ToList();

        // Execute Top Programs query
        var topProgramsData = await connection.QueryAsync<TopProgramData>(
            "EXEC SP_GetTopPrograms @YearRang, @Category", 
            parameters
        );
        response.TopPrograms = topProgramsData.ToList();

        // Execute Top Agencies query
        var topAgenciesData = await connection.QueryAsync<TopAgencyData>(
            "EXEC SP_GET_TOP_AGENCIES @YearRang, @Category", 
            parameters
        );
        response.TopAgencies = topAgenciesData.ToList();

        return response;
    }
    catch (Exception ex)
    {
        throw new Exception($"Error executing chart data queries: {ex.Message}", ex);
    }
}
        }
}
