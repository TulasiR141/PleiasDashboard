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
    public class MIPDataRepository : IMIPDataRepository
    {
        private readonly string? _connectionString;

        public MIPDataRepository(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        public async Task<IEnumerable<MIPData>> GetAllMIPDataAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM MIP_DATA ORDER BY CREATED_DATE DESC";
            return await connection.QueryAsync<MIPData>(query);
        }

        public async Task<MIPData?> GetMIPDataByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM MIP_DATA WHERE ID = @Id";
            return await connection.QueryFirstOrDefaultAsync<MIPData>(query, new { Id = id });
        }

        public async Task<MIPData?> GetMIPDataByGuidAsync(Guid guid)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM MIP_DATA WHERE MIP_GUID = @Guid";
            return await connection.QueryFirstOrDefaultAsync<MIPData>(query, new { Guid = guid });
        }

        public async Task<IEnumerable<MIPData>> GetMIPDataByCountryAsync(string country)
        {
            using var connection = new SqlConnection(_connectionString);
            var query = "SELECT * FROM MIP_DATA WHERE COUNTRY = @Country ORDER BY CREATED_DATE DESC";
            return await connection.QueryAsync<MIPData>(query, new { Country = country });
        }
    }
}
