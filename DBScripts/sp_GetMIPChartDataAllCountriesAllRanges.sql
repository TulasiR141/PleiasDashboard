-- Stored Procedure for All Countries and All Year Ranges from MIP_DATA table
CREATE PROCEDURE [dbo].[sp_GetMIPChartDataAllCountriesAllRanges]
AS
BEGIN
    SET NOCOUNT ON;
    
    WITH CountryYearData AS (
        -- 2021-2024 Data
        SELECT 
            [COUNTRY],
            '2021-2024' AS YearRange,
            ISNULL(SUM([P1_AMOUNT_21_24]), 0) AS P1_Amount,
            ISNULL(SUM([P2_AMOUNT_21_24]), 0) AS P2_Amount,
            ISNULL(SUM([P3_AMOUNT_21_24]), 0) AS P3_Amount,
            ISNULL(SUM([SUPPORT_MEASURES_AMOUNT_21_24]), 0) AS Support_Amount
        FROM [MIP_DATA]
        GROUP BY [COUNTRY]
        
        UNION ALL
        
        -- 2025-2027 Data
        SELECT 
            [COUNTRY],
            '2025-2027' AS YearRange,
            ISNULL(SUM([P1_AMOUNT_25_27]), 0) AS P1_Amount,
            ISNULL(SUM([P2_AMOUNT_25_27]), 0) AS P2_Amount,
            ISNULL(SUM([P3_AMOUNT_25_27]), 0) AS P3_Amount,
            ISNULL(SUM([SUPPORT_MEASURES_AMOUNT_25_27]), 0) AS Support_Amount
        FROM [MIP_DATA]
        GROUP BY [COUNTRY]
        
        UNION ALL
        
        -- 2021-2027 Combined Data
        SELECT 
            [COUNTRY],
            '2021-2027' AS YearRange,
            ISNULL(SUM([P1_AMOUNT_21_24] + [P1_AMOUNT_25_27]), 0) AS P1_Amount,
            ISNULL(SUM([P2_AMOUNT_21_24] + [P2_AMOUNT_25_27]), 0) AS P2_Amount,
            ISNULL(SUM([P3_AMOUNT_21_24] + [P3_AMOUNT_25_27]), 0) AS P3_Amount,
            ISNULL(SUM([SUPPORT_MEASURES_AMOUNT_21_24] + [SUPPORT_MEASURES_AMOUNT_25_27]), 0) AS Support_Amount
        FROM [MIP_DATA]
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
    )
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
    ) AS FinalData
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



