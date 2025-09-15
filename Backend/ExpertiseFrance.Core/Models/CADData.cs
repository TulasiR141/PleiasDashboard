using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExpertiseFrance.Core.Models
{
    [Table("CAD")]
    public class CADData
    {
        [Key]
        public int ID { get; set; }
        
        public Guid CAD_GUID { get; set; }
        
        public int? CODE_CAD { get; set; }
        
        [MaxLength(200)]
        public string? NAME { get; set; }
        
        [MaxLength(100)]
        public string? CATEGORY { get; set; }
        
        public int? CATEGORYID { get; set; }
        
        [MaxLength(200)]
        public string? FILENAME { get; set; }
        
        [Column(TypeName = "NUMERIC(5, 2)")]
        public decimal? PERCENTAGE { get; set; }
        
        public int? DEPARTMENT { get; set; }
        
        public int? PRIORITY_AREAS { get; set; }
        
        public DateTime CREATED_DATE { get; set; }
        
        [MaxLength(100)]
        public string? CREATED_BY { get; set; }
        
        public DateTime? UPDATED_DATE { get; set; }
        
        [MaxLength(100)]
        public string? UPDATED_BY { get; set; }
    }
}
