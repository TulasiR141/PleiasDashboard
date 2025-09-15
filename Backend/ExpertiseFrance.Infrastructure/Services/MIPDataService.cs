using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpertiseFrance.Core.Models;
using ExpertiseFrance.Core.Interfaces.Repositories;
using ExpertiseFrance.Core.Interfaces.Services;

namespace ExpertiseFrance.Infrastructure.Services
{
    public class MIPDataService : IMIPDataService
    {
        private readonly IMIPDataRepository _mipDataRepository;

        public MIPDataService(IMIPDataRepository mipDataRepository)
        {
            _mipDataRepository = mipDataRepository;
        }

        public async Task<IEnumerable<MIPData>> GetAllMIPDataAsync()
        {
            return await _mipDataRepository.GetAllMIPDataAsync();
        }

        public async Task<MIPData?> GetMIPDataByIdAsync(int id)
        {
            return await _mipDataRepository.GetMIPDataByIdAsync(id);
        }

        public async Task<MIPData?> GetMIPDataByGuidAsync(Guid guid)
        {
            return await _mipDataRepository.GetMIPDataByGuidAsync(guid);
        }

        public async Task<IEnumerable<MIPData>> GetMIPDataByCountryAsync(string country)
        {
            if (string.IsNullOrWhiteSpace(country))
                throw new ArgumentException("Country cannot be null or empty", nameof(country));

            return await _mipDataRepository.GetMIPDataByCountryAsync(country);
        }
    }
}
