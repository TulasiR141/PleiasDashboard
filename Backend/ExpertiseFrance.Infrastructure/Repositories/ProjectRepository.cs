using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Dapper;
using ExpertiseFrance.Core.Models;
using System.Linq;
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
        
        public async Task<Section3ChartsDataResponse> GetSection3ChartsDataAsync(string yearRange = null, string category = null, string department = null)
        {
            using var connection = new SqlConnection(_connectionString);
            try
            {
                var response = new Section3ChartsDataResponse();

                // Build WHERE clauses based on filters
                var whereConditions = new List<string>();
                var parameters = new DynamicParameters();

                if (!string.IsNullOrEmpty(yearRange))
                {
                    if (yearRange == "2021-2024")
                        whereConditions.Add("p.YEAR BETWEEN 2021 AND 2024");
                    else if (yearRange == "2025-2027")
                        whereConditions.Add("p.YEAR BETWEEN 2025 AND 2027");
                    else if (yearRange == "2021-2027")
                        whereConditions.Add("p.YEAR BETWEEN 2021 AND 2027");
                }

                if (!string.IsNullOrEmpty(category))
                {
                    whereConditions.Add("c.CATEGORY = @Category");
                    parameters.Add("@Category", category);
                }

                if (!string.IsNullOrEmpty(department))
                {
                    whereConditions.Add("d.DEPARTMENT_NAME = @Department");
                    parameters.Add("@Department", department);
                }

                var whereClause = whereConditions.Count > 0 ? "WHERE " + string.Join(" AND ", whereConditions) : "";

                // Top Countries Query with MIP projected amounts
                string mipAmountColumns = "";
                if (yearRange == "2021-2024")
                {
                    mipAmountColumns = "ISNULL(SUPPORT_MEASURES_AMOUNT_21_24, 0) + ISNULL(P1_AMOUNT_21_24, 0) + ISNULL(P2_AMOUNT_21_24, 0) + ISNULL(P3_AMOUNT_21_24, 0)";
                }
                else if (yearRange == "2025-2027")
                {
                    mipAmountColumns = "ISNULL(SUPPORT_MEASURES_AMOUNT_25_27, 0) + ISNULL(P1_AMOUNT_25_27, 0) + ISNULL(P2_AMOUNT_25_27, 0) + ISNULL(P3_AMOUNT_25_27, 0)";
                }
                else // 2021-2027 or default
                {
                    mipAmountColumns = "ISNULL(SUPPORT_MEASURES_AMOUNT_21_24, 0) + ISNULL(P1_AMOUNT_21_24, 0) + ISNULL(P2_AMOUNT_21_24, 0) + ISNULL(P3_AMOUNT_21_24, 0) + ISNULL(SUPPORT_MEASURES_AMOUNT_25_27, 0) + ISNULL(P1_AMOUNT_25_27, 0) + ISNULL(P2_AMOUNT_25_27, 0) + ISNULL(P3_AMOUNT_25_27, 0)";
                }

                var topCountriesQuery = $@"
                    SELECT TOP 10
                        ISNULL(engaged.Country, projected.Country) as Country,
                        ISNULL(engaged.EngagedAmount, 0) as EngagedAmount,
                        ISNULL(projected.ProjectedAmount, 0) as ProjectedAmount,
                        @YearRange as YearRange,
                        @Category as Category
                    FROM (
                        SELECT
                            Country,
                            SUM(EngagedAmount) as EngagedAmount
                        FROM (
                            SELECT DISTINCT
                                p.COUNTRY as Country,
                                p.FILENAME,
                                CASE WHEN ISNUMERIC(p.COLUMN_1_3_1_TOTAL_AMOUNT) = 1
                                     THEN CAST(p.COLUMN_1_3_1_TOTAL_AMOUNT as BIGINT)
                                     ELSE 0 END as EngagedAmount
                            FROM PROJECTS p
                            INNER JOIN CAD c ON p.FILENAME = c.FILENAME
                            INNER JOIN DEPARTMENTS d ON p.FILENAME = d.FILENAME
                            {whereClause}
                            AND p.COUNTRY IS NOT NULL
                        ) uniqueProjects
                        GROUP BY Country
                    ) engaged
                    FULL OUTER JOIN (
                        SELECT
                            m.COUNTRY as Country,
                            SUM({mipAmountColumns}) as ProjectedAmount
                        FROM MIP_DATA m
                        WHERE m.COUNTRY IS NOT NULL
                        GROUP BY m.COUNTRY
                    ) projected ON engaged.Country = projected.Country
                    ORDER BY ISNULL(engaged.EngagedAmount, 0) DESC";

                parameters.Add("@YearRange", yearRange ?? "");
                parameters.Add("@Category", category ?? "");

                var topCountriesData = await connection.QueryAsync<TopCountryData>(topCountriesQuery, parameters);
                response.TopCountries = topCountriesData.ToList();

                // Top Programs Query
                var topProgramsQuery = $@"
                    SELECT DISTINCT TOP 10
                        p.ACTION_TITLE as Program,
                        CASE WHEN ISNUMERIC(p.COLUMN_1_3_1_TOTAL_AMOUNT) = 1
                             THEN CAST(p.COLUMN_1_3_1_TOTAL_AMOUNT as BIGINT)
                             ELSE 0 END as TotalAmount,
                        @Category as Category,
                        @YearRange as YearRange
                    FROM PROJECTS p
                    INNER JOIN CAD c ON p.FILENAME = c.FILENAME
                    INNER JOIN DEPARTMENTS d ON p.FILENAME = d.FILENAME
                    {whereClause}
                    AND p.ACTION_TITLE IS NOT NULL
                    ORDER BY TotalAmount DESC";

                var topProgramsData = await connection.QueryAsync<TopProgramData>(topProgramsQuery, parameters);
                response.TopPrograms = topProgramsData.ToList();

                // Top Agencies Query
                var topAgenciesQuery = $@"
                    SELECT TOP 10
                        @YearRange as YearRange,
                        Agency,
                        @Category as Category,
                        SUM(IndirectAmount) as IndirectAmount,
                        COUNT(DISTINCT FILENAME) as ProjectCount
                    FROM (
                        SELECT DISTINCT
                            p.FILENAME,
                            imd.Agence as Agency,
                            CASE WHEN ISNUMERIC(REPLACE(imd.Indirect_Management_Amount, ' ', '')) = 1
                                 THEN CAST(REPLACE(imd.Indirect_Management_Amount, ' ', '') as BIGINT)
                                 ELSE 0 END as IndirectAmount
                        FROM PROJECTS p
                        INNER JOIN CAD c ON p.FILENAME = c.FILENAME
                        INNER JOIN DEPARTMENTS d ON p.FILENAME = d.FILENAME
                        INNER JOIN Indirect_Management_Data imd ON p.FILENAME = imd.Filename
                        {whereClause}
                        AND imd.Agence IS NOT NULL
                    ) uniqueAgencyProjects
                    GROUP BY Agency
                    ORDER BY IndirectAmount DESC";

                var topAgenciesData = await connection.QueryAsync<TopAgencyData>(topAgenciesQuery, parameters);
                response.TopAgencies = topAgenciesData.ToList();

                return response;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error executing chart data queries: {ex.Message}", ex);
            }
        }


        public async Task<IEnumerable<TopCADData>> GetGlobalTopCADAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            var query = @"
                SELECT
                    c.CODE_CAD as CADCode,
                    c.NAME as Name,
                    COUNT(DISTINCT c.FILENAME) as ActionPlanCount
                FROM CAD c
                WHERE c.CODE_CAD IS NOT NULL
                    AND c.NAME IS NOT NULL
                    AND c.FILENAME IS NOT NULL
                GROUP BY c.CODE_CAD, c.NAME
                ORDER BY ActionPlanCount DESC";

            return await connection.QueryAsync<TopCADData>(query);
        }

        public async Task<IEnumerable<TopDepartmentData>> GetGlobalTopDepartmentsAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            var query = @"
                SELECT
                    d.DEPARTMENT_ID as DepartmentId,
                    d.DEPARTMENT_NAME as DepartmentName,
                    COUNT(DISTINCT d.FILENAME) as ActionPlanCount
                FROM DEPARTMENTS d
                WHERE d.DEPARTMENT_ID IS NOT NULL
                    AND d.DEPARTMENT_NAME IS NOT NULL
                    AND d.FILENAME IS NOT NULL
                GROUP BY d.DEPARTMENT_ID, d.DEPARTMENT_NAME
                ORDER BY ActionPlanCount DESC";

            return await connection.QueryAsync<TopDepartmentData>(query);
        }

        public async Task<IEnumerable<string>> GetDistinctCountriesAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            var sql = @"
                SELECT DISTINCT COUNTRY FROM PROJECTS WHERE COUNTRY IS NOT NULL AND LTRIM(RTRIM(COUNTRY)) <> ''
                UNION
                SELECT DISTINCT COUNTRY FROM MIP_DATA WHERE COUNTRY IS NOT NULL AND LTRIM(RTRIM(COUNTRY)) <> ''
                ORDER BY COUNTRY";
            return await connection.QueryAsync<string>(sql);
        }

        public async Task<IEnumerable<string>> GetDistinctDepartmentsAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            var sql = @"
                SELECT DISTINCT DEPARTMENT_NAME
                FROM DEPARTMENTS
                WHERE DEPARTMENT_NAME IS NOT NULL AND LTRIM(RTRIM(DEPARTMENT_NAME)) <> ''
                ORDER BY DEPARTMENT_NAME";
            return await connection.QueryAsync<string>(sql);
        }

        public async Task<NormalizedCountrySection2Response> GetNormalizedSection2ChartsByCountryAsync(string country)
        {
            using var connection = new SqlConnection(_connectionString);

            var response = new NormalizedCountrySection2Response { Country = country };
            var p = new { Country = country };

            // Fetch engage and projected raw data via SPs, filtered in-memory
            var engageAll = await connection.QueryAsync<ChartDataItem>("EXEC sp_GetProjectsChartDataAllCountriesAllRanges");
            var projectedAll = await connection.QueryAsync<ChartDataItem>("EXEC [dbo].[sp_GetMIPChartDataAllCountriesAllRanges]");
            var engage = engageAll.Where(d => d.Country?.Equals(country, StringComparison.OrdinalIgnoreCase) == true).ToList();
            var projected = projectedAll.Where(d => d.Country?.Equals(country, StringComparison.OrdinalIgnoreCase) == true).ToList();

            // Titles from MIP_DATA
            var titleRow = await connection.QueryFirstOrDefaultAsync(
                @"SELECT P1_TITLE, P2_TITLE, P3_TITLE FROM MIP_DATA WHERE COUNTRY = @Country", p);
            if (titleRow != null)
            {
                response.Projected.P1.Title = titleRow.P1_TITLE;
                response.Projected.P2.Title = titleRow.P2_TITLE;
                response.Projected.P3.Title = titleRow.P3_TITLE;
                response.Engage.P1.Title = titleRow.P1_TITLE;
                response.Engage.P2.Title = titleRow.P2_TITLE;
                response.Engage.P3.Title = titleRow.P3_TITLE;
            }

            // Compute totals and Unknown for engage
            var totalsRows = await connection.QueryAsync(
                @"WITH Totals AS (
                        SELECT COUNTRY, '2021-2024' AS YearRange, ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [COLUMN_1_3_1_TOTAL_AMOUNT] ELSE 0 END),0) AS Total
                        FROM PROJECTS WHERE COUNTRY = @Country GROUP BY COUNTRY
                        UNION ALL
                        SELECT COUNTRY, '2025-2027' AS YearRange, ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [COLUMN_1_3_1_TOTAL_AMOUNT] ELSE 0 END),0) AS Total
                        FROM PROJECTS WHERE COUNTRY = @Country GROUP BY COUNTRY
                   ) SELECT COUNTRY, YearRange, Total FROM Totals", p);
            var totals = totalsRows.ToDictionary(r => ((string)r.YearRange).Trim(), r => (decimal)r.Total, StringComparer.OrdinalIgnoreCase);

            foreach (var yr in new[] { "2021-2024", "2025-2027" })
            {
                var subset = engage.Where(e => string.Equals(e.YearRange?.Trim(), yr, StringComparison.OrdinalIgnoreCase)).ToList();
                if (!totals.TryGetValue(yr, out var total) || total <= 0m) continue;
                var knownSum = subset.Sum(x => x.Amount);
                foreach (var item in subset)
                {
                    item.Percentage = total == 0 ? 0 : Math.Round((item.Amount * 100m) / total, 2, MidpointRounding.AwayFromZero);
                }
                var unknown = total - knownSum;
                if (unknown > 0m)
                {
                    engage.Add(new ChartDataItem
                    {
                        Country = country,
                        YearRange = yr,
                        Area = "Unknown",
                        Title = null,
                        Amount = Math.Round(unknown, 2, MidpointRounding.AwayFromZero),
                        Percentage = Math.Round((unknown * 100m) / total, 2, MidpointRounding.AwayFromZero)
                    });
                }
            }

            // Helper to normalize area
            string Norm(string? a)
            {
                var u = (a ?? "").Trim().ToUpperInvariant();
                if (u == "P1" || u == "P2" || u == "P3") return u;
                if (u == "SUPPORT" || u == "SUPPORT_MEASURE" || u == "SUPPORT MEASURE") return "SUPPORT";
                if (u == "UNKNOWN") return "UNKNOWN";
                return u;
            }

            // Aggregate per yearRange for Projected and Engage
            (decimal p1, decimal p2, decimal p3, decimal sup, decimal unk) SumByYear(IEnumerable<ChartDataItem> items, string yr)
            {
                var list = items.Where(i => string.Equals(i.YearRange?.Trim(), yr, StringComparison.OrdinalIgnoreCase)).ToList();
                decimal p1 = 0, p2 = 0, p3 = 0, sup = 0, unk = 0;
                foreach (var it in list)
                {
                    switch (Norm(it.Area))
                    {
                        case "P1": p1 += it.Amount; break;
                        case "P2": p2 += it.Amount; break;
                        case "P3": p3 += it.Amount; break;
                        case "SUPPORT": sup += it.Amount; break;
                        case "UNKNOWN": unk += it.Amount; break;
                    }
                }
                return (p1, p2, p3, sup, unk);
            }

            void FillBreakdowns((decimal p1, decimal p2, decimal p3, decimal sup, decimal unk) sums, NormalizedPrioritySet target, bool is21_24)
            {
                var total = sums.p1 + sums.p2 + sums.p3 + sums.sup + sums.unk;
                decimal pct(decimal v) => total == 0 ? 0 : Math.Round((v * 100m) / total, 2, MidpointRounding.AwayFromZero);
                if (is21_24)
                {
                    target.P1.Amount_21_24 = sums.p1; target.P1.Percentage_21_24 = pct(sums.p1);
                    target.P2.Amount_21_24 = sums.p2; target.P2.Percentage_21_24 = pct(sums.p2);
                    target.P3.Amount_21_24 = sums.p3; target.P3.Percentage_21_24 = pct(sums.p3);
                    target.SupportMeasure.Amount_21_24 = sums.sup; target.SupportMeasure.Percentage_21_24 = pct(sums.sup);
                    target.Unknown.Amount_21_24 = sums.unk; target.Unknown.Percentage_21_24 = pct(sums.unk);
                }
                else
                {
                    target.P1.Amount_25_27 = sums.p1; target.P1.Percentage_25_27 = pct(sums.p1);
                    target.P2.Amount_25_27 = sums.p2; target.P2.Percentage_25_27 = pct(sums.p2);
                    target.P3.Amount_25_27 = sums.p3; target.P3.Percentage_25_27 = pct(sums.p3);
                    target.SupportMeasure.Amount_25_27 = sums.sup; target.SupportMeasure.Percentage_25_27 = pct(sums.sup);
                    target.Unknown.Amount_25_27 = sums.unk; target.Unknown.Percentage_25_27 = pct(sums.unk);
                }
            }

            var proj_2124 = SumByYear(projected, "2021-2024");
            var proj_2527 = SumByYear(projected, "2025-2027");
            FillBreakdowns(proj_2124, response.Projected, true);
            FillBreakdowns(proj_2527, response.Projected, false);

            var eng_2124 = SumByYear(engage, "2021-2024");
            var eng_2527 = SumByYear(engage, "2025-2027");
            FillBreakdowns(eng_2124, response.Engage, true);
            FillBreakdowns(eng_2527, response.Engage, false);

            // CAD and Actions inline
            var cadRows = await connection.QueryAsync<ProjectCadData>(
                @"SELECT DISTINCT
                        c.NAME AS Name,
                        c.CODE_CAD AS CadCode,
                        p.YEAR AS Year,
                        p.COUNTRY AS Country,
                        CASE 
                            WHEN p.YEAR BETWEEN 2021 AND 2024 THEN '2021-2024'
                            WHEN p.YEAR BETWEEN 2025 AND 2027 THEN '2025-2027'
                            WHEN p.YEAR BETWEEN 2021 AND 2027 THEN '2021-2027'
                        END AS YearRange
                  FROM PROJECTS p
                  INNER JOIN CAD c ON p.FILENAME = c.FILENAME
                  WHERE p.COUNTRY = @Country
                  ORDER BY p.COUNTRY, p.YEAR, c.NAME", p);
            var actionRows = await connection.QueryAsync<ActionData>(
                @"WITH YearRangeData AS (
                        SELECT [COUNTRY],
                               CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN '2021-2024'
                                    WHEN [YEAR] BETWEEN 2025 AND 2027 THEN '2025-2027'
                                    WHEN [YEAR] BETWEEN 2021 AND 2027 THEN '2021-2027' END AS YearRange,
                               [ACTION_TITLE],
                               [COLUMN_1_3_1_TOTAL_AMOUNT],
                               CASE WHEN ISNUMERIC(REPLACE([GLOBAL_INDIRECT_MANAGEMENT_AMOUNT], ' ', '')) = 1 
                                    THEN CONVERT(DECIMAL(18,2), REPLACE([GLOBAL_INDIRECT_MANAGEMENT_AMOUNT], ' ', ''))
                                    ELSE 0.00 END AS IndirectAmount_Clean
                        FROM [PROJECTS]
                        WHERE [COUNTRY] = @Country AND [YEAR] BETWEEN 2021 AND 2027
                   )
                   SELECT [COUNTRY] AS Country,
                          YearRange,
                          [ACTION_TITLE] AS ActionTitle,
                          CAST(SUM([COLUMN_1_3_1_TOTAL_AMOUNT]) AS DECIMAL(18,2)) AS TotalAmount,
                          CAST(SUM(IndirectAmount_Clean) AS DECIMAL(18,2)) AS IndirectAmount
                   FROM YearRangeData
                   GROUP BY [COUNTRY], YearRange, [ACTION_TITLE]
                   ORDER BY [COUNTRY], YearRange, [ACTION_TITLE]", p);

            response.CadDataChart2 = cadRows.ToList();
            response.ActionDataChart3 = actionRows.ToList();

            return response;
        }
        }
}
