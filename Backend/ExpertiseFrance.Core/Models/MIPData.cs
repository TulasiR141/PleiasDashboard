using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpertiseFrance.Core.Models
{
    [Table("MIP_DATA")]
    public class MIPData
    {
        [Key]
        public int ID { get; set; }
        
        public Guid MIP_GUID { get; set; }
        
        [MaxLength(100)]
        public string? COUNTRY { get; set; }
        
        public decimal? SUPPORT_MEASURES_AMOUNT_21_24 { get; set; }
        
        [Column(TypeName = "NUMERIC(5, 2)")]
        public decimal? SUPPORT_MEASURES_PERCENT_21_24 { get; set; }
        
        public decimal? SUPPORT_MEASURES_AMOUNT_25_27 { get; set; }
        
        [Column(TypeName = "NUMERIC(5, 2)")]
        public decimal? SUPPORT_MEASURES_PERCENT_25_27 { get; set; }
        
        [MaxLength(200)]
        public string? P1_TITLE { get; set; }
        
        public decimal? P1_AMOUNT_21_24 { get; set; }
        
        [Column(TypeName = "NUMERIC(5, 2)")]
        public decimal? P1_PERCENT_21_24 { get; set; }
        
        public decimal? P1_AMOUNT_25_27 { get; set; }
        
        [Column(TypeName = "NUMERIC(5, 2)")]
        public decimal? P1_PERCENT_25_27 { get; set; }
        
        [MaxLength(115)]
        public string? P2_TITLE { get; set; }
        
        public decimal? P2_AMOUNT_21_24 { get; set; }
        
        [Column(TypeName = "NUMERIC(5, 2)")]
        public decimal? P2_PERCENT_21_24 { get; set; }
        
        public decimal? P2_AMOUNT_25_27 { get; set; }
        
        [Column(TypeName = "NUMERIC(5, 2)")]
        public decimal? P2_PERCENT_25_27 { get; set; }
        
        [MaxLength(91)]
        public string? P3_TITLE { get; set; }
        
        public decimal? P3_AMOUNT_21_24 { get; set; }
        
        [Column(TypeName = "NUMERIC(5, 2)")]
        public decimal? P3_PERCENT_21_24 { get; set; }
        
        public decimal? P3_AMOUNT_25_27 { get; set; }
        
        [Column(TypeName = "NUMERIC(5, 2)")]
        public decimal? P3_PERCENT_25_27 { get; set; }
        
        public DateTime CREATED_DATE { get; set; }
        
        [MaxLength(100)]
        public string? CREATED_BY { get; set; }
        
        public DateTime? UPDATED_DATE { get; set; }
        
        [MaxLength(100)]
        public string? UPDATED_BY { get; set; }
    }
}
