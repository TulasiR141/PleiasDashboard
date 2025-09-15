using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ExpertiseFrance.Core.Models;

namespace ExpertiseFrance.Core.Interfaces.Repositories
{
    public interface ICADDataRepository
    {
        Task<IEnumerable<CADData>> GetAllCADDataAsync();
        Task<CADData?> GetCADDataByIdAsync(int id);
        Task<CADData?> GetCADDataByGuidAsync(Guid guid);
        Task<IEnumerable<CADData>> GetCADDataByCategoryAsync(string category);
        Task<IEnumerable<CADData>> GetCADDataByDepartmentAsync(int department);
    }
}
