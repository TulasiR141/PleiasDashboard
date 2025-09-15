CREATE PROCEDURE [dbo].[sp_GetChart3DataAllCountriesAllRanges]
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH YearRangeData AS (
        -- 2021-2024 Data
        SELECT 
            [COUNTRY],
            '2021-2024' AS YearRange,
            [ACTION_TITLE],
            [COLUMN_1_3_1_TOTAL_AMOUNT],
            CASE 
                WHEN ISNUMERIC(REPLACE([GLOBAL_INDIRECT_MANAGEMENT_AMOUNT], ' ', '')) = 1 
                THEN CONVERT(DECIMAL(18,2), REPLACE([GLOBAL_INDIRECT_MANAGEMENT_AMOUNT], ' ', ''))
                ELSE 0.00 
            END AS IndirectAmount_Clean
        FROM [PROJECTS]
        WHERE [YEAR] BETWEEN 2021 AND 2024
        
        UNION ALL
        
        -- 2025-2027 Data
        SELECT 
            [COUNTRY],
            '2025-2027' AS YearRange,
            [ACTION_TITLE],
            [COLUMN_1_3_1_TOTAL_AMOUNT],
            CASE 
                WHEN ISNUMERIC(REPLACE([GLOBAL_INDIRECT_MANAGEMENT_AMOUNT], ' ', '')) = 1 
                THEN CONVERT(DECIMAL(18,2), REPLACE([GLOBAL_INDIRECT_MANAGEMENT_AMOUNT], ' ', ''))
                ELSE 0.00 
            END AS IndirectAmount_Clean
        FROM [PROJECTS]
        WHERE [YEAR] BETWEEN 2025 AND 2027
        
        UNION ALL
        
        -- 2021-2027 Combined Data
        SELECT 
            [COUNTRY],
            '2021-2027' AS YearRange,
            [ACTION_TITLE],
            [COLUMN_1_3_1_TOTAL_AMOUNT],
            CASE 
                WHEN ISNUMERIC(REPLACE([GLOBAL_INDIRECT_MANAGEMENT_AMOUNT], ' ', '')) = 1 
                THEN CONVERT(DECIMAL(18,2), REPLACE([GLOBAL_INDIRECT_MANAGEMENT_AMOUNT], ' ', ''))
                ELSE 0.00 
            END AS IndirectAmount_Clean
        FROM [PROJECTS]
        WHERE [YEAR] BETWEEN 2021 AND 2027
    )
    SELECT 
        [COUNTRY] Country,
        YearRange,
        [ACTION_TITLE] ActionTitle,
        CAST(SUM([COLUMN_1_3_1_TOTAL_AMOUNT]) AS DECIMAL(18,2)) AS TotalAmount,
        CAST(SUM(IndirectAmount_Clean) AS DECIMAL(18,2)) AS IndirectAmount
    FROM YearRangeData
    GROUP BY 
        [COUNTRY],
        YearRange,
        [ACTION_TITLE]
    ORDER BY 
        [COUNTRY],
        CASE YearRange
            WHEN '2021-2024' THEN 1
            WHEN '2025-2027' THEN 2
            WHEN '2021-2027' THEN 3
        END,
        [ACTION_TITLE];
END