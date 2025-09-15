using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpertiseFrance.Core.Models;
using ExpertiseFrance.Core.Interfaces.Repositories;
using ExpertiseFrance.Core.Interfaces.Services;

namespace ExpertiseFrance.Infrastructure.Services
{
    public class CADDataService : ICADDataService
    {
        private readonly ICADDataRepository _cadDataRepository;

        public CADDataService(ICADDataRepository cadDataRepository)
        {
            _cadDataRepository = cadDataRepository;
        }

        public async Task<IEnumerable<CADData>> GetAllCADDataAsync()
        {
            return await _cadDataRepository.GetAllCADDataAsync();
        }

        public async Task<CADData?> GetCADDataByIdAsync(int id)
        {
            return await _cadDataRepository.GetCADDataByIdAsync(id);
        }

        public async Task<CADData?> GetCADDataByGuidAsync(Guid guid)
        {
            return await _cadDataRepository.GetCADDataByGuidAsync(guid);
        }

        public async Task<IEnumerable<CADData>> GetCADDataByCategoryAsync(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                throw new ArgumentException("Category cannot be null or empty", nameof(category));

            return await _cadDataRepository.GetCADDataByCategoryAsync(category);
        }

        public async Task<IEnumerable<CADData>> GetCADDataByDepartmentAsync(int department)
        {
            if (department <= 0)
                throw new ArgumentException("Department must be a positive number", nameof(department));

            return await _cadDataRepository.GetCADDataByDepartmentAsync(department);
        }
    }
}
