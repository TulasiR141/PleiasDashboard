using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpertiseFrance.Core.Models;
using ExpertiseFrance.Core.Interfaces.Repositories;
using ExpertiseFrance.Core.Interfaces.Services;

namespace ExpertiseFrance.Infrastructure.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;

        public ProjectService(IProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;
        }

        public async Task<IEnumerable<Project>> GetAllProjectsAsync()
        {
            return await _projectRepository.GetAllProjectsAsync();
        }  
        public async Task<IEnumerable<TopCountryData>> GetAllCadCategory()
        {
            return await _projectRepository.GetAllCadCategory();
        }
        

        public async Task<Project?> GetProjectByIdAsync(int id)
        {
            return await _projectRepository.GetProjectByIdAsync(id);
        }

        public async Task<Project?> GetProjectByGuidAsync(Guid guid)
        {
            return await _projectRepository.GetProjectByGuidAsync(guid);
        }

        public async Task<IEnumerable<Project>> GetProjectsByCountryAsync(string country)
        {
            if (string.IsNullOrWhiteSpace(country))
                throw new ArgumentException("Country cannot be null or empty", nameof(country));

            return await _projectRepository.GetProjectsByCountryAsync(country);
        }

        public async Task<IEnumerable<Project>> GetProjectsByYearAsync(int year)
        {
            if (year <= 0)
                throw new ArgumentException("Year must be a positive number", nameof(year));

            return await _projectRepository.GetProjectsByYearAsync(year);
        }
        public async Task<CountryChartDataResponse> GetSection2ChartsDataAsync()
        {
            return await _projectRepository.GetSection2ChartsDataAsync();
        }
        public async Task<Section3ChartsDataResponse> GetSection3ChartsDataAsync(string yearRange = null, string category = null)
        {
            return await _projectRepository.GetSection3ChartsDataAsync(yearRange,category);
        }

        public async Task<IEnumerable<TopCADData>> GetGlobalTopCADAsync()
        {
            return await _projectRepository.GetGlobalTopCADAsync();
        }

        public async Task<IEnumerable<TopDepartmentData>> GetGlobalTopDepartmentsAsync()
        {
            return await _projectRepository.GetGlobalTopDepartmentsAsync();
        }
    }
}
