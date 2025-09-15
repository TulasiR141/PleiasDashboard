using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpertiseFrance.Core.Models;

namespace ExpertiseFrance.Core.Interfaces.Services
{
    public interface IMIPDataService
    {
        Task<IEnumerable<MIPData>> GetAllMIPDataAsync();
        Task<MIPData?> GetMIPDataByIdAsync(int id);
        Task<MIPData?> GetMIPDataByGuidAsync(Guid guid);
        Task<IEnumerable<MIPData>> GetMIPDataByCountryAsync(string country);
    }
}
