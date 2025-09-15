using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpertiseFrance.Core.Models
{
    [Table("PROJECTS")]
    public class Project
    {
        [Key]
        public int ID { get; set; }

        public Guid PROJECTGUID { get; set; }

        [MaxLength(50)]
        public string? COUNTRY { get; set; }

        public int? YEAR { get; set; }

        [MaxLength(200)]
        public string? ACTION_TITLE { get; set; }

        [MaxLength(100)]
        public string? ANNUAL_ACTION_TITLE { get; set; }

        [MaxLength(100)]
        public string? FILENAME { get; set; }

        public int? COLUMN_1_3_1_TOTAL_AMOUNT { get; set; }

        [MaxLength(50)]
        public string? GLOBAL_INDIRECT_MANAGEMENT_AMOUNT { get; set; }

        // Made these nullable in case they don't exist in your table
        public DateTime? CREATED_DATE { get; set; }

        [MaxLength(100)]
        public string? CREATED_BY { get; set; }

        public DateTime? UPDATED_DATE { get; set; }

        [MaxLength(100)]
        public string? UPDATED_BY { get; set; }
    }

    // Models for Chart Data
    public class CountryChartDataResponse
    {
        public List<ChartDataItem> Engage { get; set; } = new List<ChartDataItem>();
        public List<ChartDataItem> Projected { get; set; } = new List<ChartDataItem>();
        public List<ProjectCadData> CadDataChart2 { get; set; } = new List<ProjectCadData>();
        public List<ActionData> ActionDataChart3 { get; set; } = new List<ActionData>();
    }

    public class ChartDataItem
    {
        public string Country { get; set; }
        public string YearRange { get; set; }
        public string Area { get; set; }
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
    }
    public class ProjectCadData
    {
        public string Name { get; set; }

        public int CadCode { get; set; }

        public int Year { get; set; }

        public string Country { get; set; }

        public string YearRange { get; set; }
    }
    public class ActionData
    {
        public string Country { get; set; }

        public string YearRange { get; set; }

        public string ActionTitle { get; set; }

        public decimal TotalAmount { get; set; }

        public decimal IndirectAmount { get; set; }
    }
    public class TopCountryData
{
    public string Country { get; set; }
    public long EngagedAmount { get; set; }
    public long ProjectedAmount { get; set; }
    public string YearRange { get; set; }
    public string Category { get; set; }
}

public class TopProgramData
{
    public string Program { get; set; }
    public long TotalAmount { get; set; }
    public string Category { get; set; }
    public string YearRange { get; set; }
}

public class TopAgencyData
{
    public string YearRange { get; set; }
    public string Agency { get; set; }
    public string Category { get; set; }
    public long IndirectAmount { get; set; }
    public int ProjectCount { get; set; }
}

// Response model for the combined chart data
public class Section3ChartsDataResponse
{
    public List<TopCountryData> TopCountries { get; set; } = new List<TopCountryData>();
    public List<TopProgramData> TopPrograms { get; set; } = new List<TopProgramData>();
    public List<TopAgencyData> TopAgencies { get; set; } = new List<TopAgencyData>();
}

}
