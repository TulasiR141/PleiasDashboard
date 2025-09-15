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
    public class CADDataRepository : ICADDataRepository
    {
        private readonly string? _connectionString;

        public CADDataRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<IEnumerable<CADData>> GetAllCADDataAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM CAD ORDER BY CREATED_DATE DESC";
            return await connection.QueryAsync<CADData>(query);
        }

        public async Task<CADData?> GetCADDataByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM CAD WHERE ID = @Id";
            return await connection.QueryFirstOrDefaultAsync<CADData>(query, new { Id = id });
        }

        public async Task<CADData?> GetCADDataByGuidAsync(Guid guid)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM CAD WHERE CAD_GUID = @Guid";
            return await connection.QueryFirstOrDefaultAsync<CADData>(query, new { Guid = guid });
        }

        public async Task<IEnumerable<CADData>> GetCADDataByCategoryAsync(string category)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM CAD WHERE CATEGORY = @Category ORDER BY CREATED_DATE DESC";
            return await connection.QueryAsync<CADData>(query, new { Category = category });
        }

        public async Task<IEnumerable<CADData>> GetCADDataByDepartmentAsync(int department)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM CAD WHERE DEPARTMENT = @Department ORDER BY CREATED_DATE DESC";
            return await connection.QueryAsync<CADData>(query, new { Department = department });
        }
    }
}
