using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpertiseFrance.Core.Models;

namespace ExpertiseFrance.Core.Interfaces.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<Project>> GetAllProjectsAsync();
        Task<Project?> GetProjectByIdAsync(int id);
        Task<Project?> GetProjectByGuidAsync(Guid guid);
        Task<IEnumerable<Project>> GetProjectsByCountryAsync(string country);
        Task<IEnumerable<Project>> GetProjectsByYearAsync(int year);
        // Add this to your IChartService interface
         Task<CountryChartDataResponse> GetSection2ChartsDataAsync();
        Task<Section3ChartsDataResponse> GetSection3ChartsDataAsync(string yearRange = null, string category = null);
        Task<IEnumerable<TopCountryData>> GetAllCadCategory();
        Task<IEnumerable<TopCADData>> GetGlobalTopCADAsync();
        Task<IEnumerable<TopDepartmentData>> GetGlobalTopDepartmentsAsync();
    }
}
