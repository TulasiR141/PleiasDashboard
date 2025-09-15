
Create PROCEDURE [dbo].[sp_GetProjectsChartDataAllCountriesAllRanges]
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH CountryYearData AS (
        -- 2021-2024 Data
        SELECT 
            [COUNTRY],
            '2021-2024' AS YearRange,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [P1] ELSE 0 END), 0) AS P1_Amount,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [P2] ELSE 0 END), 0) AS P2_Amount,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [P3] ELSE 0 END), 0) AS P3_Amount,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [Support_Measures] ELSE 0 END), 0) AS Support_Amount
        FROM [PROJECTS]
        GROUP BY [COUNTRY]
        
        UNION ALL
        
        -- 2025-2027 Data
        SELECT 
            [COUNTRY],
            '2025-2027' AS YearRange,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [P1] ELSE 0 END), 0) AS P1_Amount,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [P2] ELSE 0 END), 0) AS P2_Amount,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [P3] ELSE 0 END), 0) AS P3_Amount,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [Support_Measures] ELSE 0 END), 0) AS Support_Amount
        FROM [PROJECTS]
        GROUP BY [COUNTRY]
        
        UNION ALL
        
        -- 2021-2027 Combined Data
        SELECT 
            [COUNTRY],
            '2021-2027' AS YearRange,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2027 THEN [P1] ELSE 0 END), 0) AS P1_Amount,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2027 THEN [P2] ELSE 0 END), 0) AS P2_Amount,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2027 THEN [P3] ELSE 0 END), 0) AS P3_Amount,
            ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2027 THEN [Support_Measures] ELSE 0 END), 0) AS Support_Amount
        FROM [PROJECTS]
        GROUP BY [COUNTRY]
    ),
    CountryTotals AS (
        SELECT 
            COUNTRY,
            YearRange,
            P1_Amount,
            P2_Amount,
            P3_Amount,
            Support_Amount,
            (P1_Amount + P2_Amount + P3_Amount + Support_Amount) AS Total_Amount
        FROM CountryYearData
    ),
    FinalData AS (
        SELECT 
            COUNTRY,
            YearRange,
            Area,
            CAST(Amount AS DECIMAL(18,2)) AS Amount,
            CASE 
                WHEN Total_Amount = 0 THEN CAST(0.00 AS DECIMAL(5,2))
                ELSE CAST(ROUND((Amount * 100.0) / Total_Amount, 2) AS DECIMAL(5,2))
            END AS Percentage
        FROM (
            SELECT COUNTRY, YearRange, Total_Amount, 'P1' AS Area, P1_Amount AS Amount FROM CountryTotals
            UNION ALL
            SELECT COUNTRY, YearRange, Total_Amount, 'P2' AS Area, P2_Amount AS Amount FROM CountryTotals
            UNION ALL
            SELECT COUNTRY, YearRange, Total_Amount, 'P3' AS Area, P3_Amount AS Amount FROM CountryTotals
            UNION ALL
            SELECT COUNTRY, YearRange, Total_Amount, 'Support Measure' AS Area, Support_Amount AS Amount FROM CountryTotals
        ) AS UnpivotedData
    )
    SELECT 
        COUNTRY Country,
        YearRange,
        Area,
        Amount,
        Percentage
    FROM FinalData
    WHERE Amount > 0 AND Percentage > 0  -- Filter out zero amounts and zero percentages
    ORDER BY 
        COUNTRY,
        CASE YearRange
            WHEN '2021-2024' THEN 1
            WHEN '2025-2027' THEN 2
            WHEN '2021-2027' THEN 3
        END,
        CASE Area
            WHEN 'P1' THEN 1
            WHEN 'P2' THEN 2
            WHEN 'P3' THEN 3
            WHEN 'Support Measure' THEN 4
        END;
END
