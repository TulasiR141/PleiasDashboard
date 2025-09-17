using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpertiseFrance.Core.Models;

namespace ExpertiseFrance.Core.Interfaces.Repositories
{
    public interface IProjectRepository
    {
        Task<IEnumerable<Project>> GetAllProjectsAsync();
        Task<Project?> GetProjectByIdAsync(int id);
        Task<Project?> GetProjectByGuidAsync(Guid guid);
        Task<IEnumerable<Project>> GetProjectsByCountryAsync(string country);
        Task<IEnumerable<Project>> GetProjectsByYearAsync(int year);
        Task<Section3ChartsDataResponse> GetSection3ChartsDataAsync(string yearRange = null, string category = null, string department = null);
        Task<IEnumerable<TopCountryData>> GetAllCadCategory();
        Task<IEnumerable<TopCADData>> GetGlobalTopCADAsync();
        Task<IEnumerable<TopDepartmentData>> GetGlobalTopDepartmentsAsync();
    Task<IEnumerable<string>> GetDistinctCountriesAsync();
    Task<IEnumerable<string>> GetDistinctDepartmentsAsync();
    Task<NormalizedCountrySection2Response> GetNormalizedSection2ChartsByCountryAsync(string country);
    }
}
