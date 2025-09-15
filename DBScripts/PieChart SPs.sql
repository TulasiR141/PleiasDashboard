

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

GO

-- Stored Procedure for All Countries and All Year Ranges from PROJECTS table
CREATE PROCEDURE [dbo].[sp_GetProjectsChartDataAllCountriesAllRanges]
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

GO

-- Stored Procedure for Single Country
CREATE PROCEDURE [dbo].[sp_GetMIPChartData]
    @Country NVARCHAR(100),
    @YearRange NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @P1_Amount DECIMAL(18,2) = 0;
    DECLARE @P2_Amount DECIMAL(18,2) = 0;
    DECLARE @P3_Amount DECIMAL(18,2) = 0;
    DECLARE @Support_Amount DECIMAL(18,2) = 0;
    DECLARE @Total_Amount DECIMAL(18,2) = 0;
    
    -- Handle different year range scenarios
    IF @YearRange = '2021-2024'
    BEGIN
        SELECT 
            @P1_Amount = ISNULL(SUM([P1_AMOUNT_21_24]), 0),
            @P2_Amount = ISNULL(SUM([P2_AMOUNT_21_24]), 0),
            @P3_Amount = ISNULL(SUM([P3_AMOUNT_21_24]), 0),
            @Support_Amount = ISNULL(SUM([SUPPORT_MEASURES_AMOUNT_21_24]), 0)
        FROM [MIP_DATA]
        WHERE [COUNTRY] = @Country;
    END
    ELSE IF @YearRange = '2025-2027'
    BEGIN
        SELECT 
            @P1_Amount = ISNULL(SUM([P1_AMOUNT_25_27]), 0),
            @P2_Amount = ISNULL(SUM([P2_AMOUNT_25_27]), 0),
            @P3_Amount = ISNULL(SUM([P3_AMOUNT_25_27]), 0),
            @Support_Amount = ISNULL(SUM([SUPPORT_MEASURES_AMOUNT_25_27]), 0)
        FROM [MIP_DATA]
        WHERE [COUNTRY] = @Country;
    END
    ELSE IF @YearRange = '2021-2027'
    BEGIN
        SELECT 
            @P1_Amount = ISNULL(SUM([P1_AMOUNT_21_24] + [P1_AMOUNT_25_27]), 0),
            @P2_Amount = ISNULL(SUM([P2_AMOUNT_21_24] + [P2_AMOUNT_25_27]), 0),
            @P3_Amount = ISNULL(SUM([P3_AMOUNT_21_24] + [P3_AMOUNT_25_27]), 0),
            @Support_Amount = ISNULL(SUM([SUPPORT_MEASURES_AMOUNT_21_24] + [SUPPORT_MEASURES_AMOUNT_25_27]), 0)
        FROM [MIP_DATA]
        WHERE [COUNTRY] = @Country;
    END
    
    -- Calculate total amount
    SET @Total_Amount = @P1_Amount + @P2_Amount + @P3_Amount + @Support_Amount;
    
    -- Return the chart data with areas and percentages
    SELECT 
        Area,
        CAST(Amount AS DECIMAL(18,2)) AS Amount,
        CASE 
            WHEN @Total_Amount = 0 THEN CAST(0.00 AS DECIMAL(5,2))
            ELSE CAST(ROUND((Amount * 100.0) / @Total_Amount, 2) AS DECIMAL(5,2))
        END AS Percentage
    FROM (
        SELECT 'P1' AS Area, @P1_Amount AS Amount WHERE @P1_Amount != 0
        UNION ALL
        SELECT 'P2' AS Area, @P2_Amount AS Amount WHERE @P2_Amount != 0
        UNION ALL
        SELECT 'P3' AS Area, @P3_Amount AS Amount WHERE @P3_Amount != 0
        UNION ALL
        SELECT 'Support Measure' AS Area, @Support_Amount AS Amount WHERE @Support_Amount != 0
    ) AS ChartData
    ORDER BY 
        CASE Area
            WHEN 'P1' THEN 1
            WHEN 'P2' THEN 2
            WHEN 'P3' THEN 3
            WHEN 'Support Measure' THEN 4
        END;
END

GO
-- Stored Procedure for Single Country and Year Range from PROJECTS table
CREATE PROCEDURE [dbo].[sp_GetProjectsChartData]
    @Country NVARCHAR(50),
    @YearRange NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @P1_Amount DECIMAL(18,2) = 0;
    DECLARE @P2_Amount DECIMAL(18,2) = 0;
    DECLARE @P3_Amount DECIMAL(18,2) = 0;
    DECLARE @Support_Amount DECIMAL(18,2) = 0;
    DECLARE @Total_Amount_Column DECIMAL(18,2) = 0;
    DECLARE @Calculated_Total DECIMAL(18,2) = 0;
    DECLARE @Remaining_Amount DECIMAL(18,2) = 0;
    
    -- Handle different year range scenarios
    IF @YearRange = '2021-2024'
    BEGIN
        SELECT 
            @P1_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [P1] ELSE 0 END), 0),
            @P2_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [P2] ELSE 0 END), 0),
            @P3_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [P3] ELSE 0 END), 0),
            @Support_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [Support_Measures] ELSE 0 END), 0),
            @Total_Amount_Column = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2024 THEN [COLUMN_1_3_1_TOTAL_AMOUNT] ELSE 0 END), 0)
        FROM [PROJECTS]
        WHERE [COUNTRY] = @Country;
    END
    ELSE IF @YearRange = '2025-2027'
    BEGIN
        SELECT 
            @P1_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [P1] ELSE 0 END), 0),
            @P2_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [P2] ELSE 0 END), 0),
            @P3_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [P3] ELSE 0 END), 0),
            @Support_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [Support_Measures] ELSE 0 END), 0),
            @Total_Amount_Column = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2025 AND 2027 THEN [COLUMN_1_3_1_TOTAL_AMOUNT] ELSE 0 END), 0)
        FROM [PROJECTS]
        WHERE [COUNTRY] = @Country;
    END
    ELSE IF @YearRange = '2021-2027'
    BEGIN
        SELECT 
            @P1_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2027 THEN [P1] ELSE 0 END), 0),
            @P2_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2027 THEN [P2] ELSE 0 END), 0),
            @P3_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2027 THEN [P3] ELSE 0 END), 0),
            @Support_Amount = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2027 THEN [Support_Measures] ELSE 0 END), 0),
            @Total_Amount_Column = ISNULL(SUM(CASE WHEN [YEAR] BETWEEN 2021 AND 2027 THEN [COLUMN_1_3_1_TOTAL_AMOUNT] ELSE 0 END), 0)
        FROM [PROJECTS]
        WHERE [COUNTRY] = @Country;
    END
    
    -- Calculate totals
    SET @Calculated_Total = @P1_Amount + @P2_Amount + @P3_Amount + @Support_Amount;
    SET @Remaining_Amount = @Total_Amount_Column - @Calculated_Total;
    
    -- Return the chart data with areas and percentages
    SELECT 
        Area,
        CAST(Amount AS DECIMAL(18,2)) AS Amount,
        CASE 
            WHEN @Total_Amount_Column = 0 THEN CAST(0.00 AS DECIMAL(5,2))
            ELSE CAST(ROUND((Amount * 100.0) / @Total_Amount_Column, 2) AS DECIMAL(5,2))
        END AS Percentage
    FROM (
        SELECT 'P1' AS Area, @P1_Amount AS Amount WHERE @P1_Amount != 0
        UNION ALL
        SELECT 'P2' AS Area, @P2_Amount AS Amount WHERE @P2_Amount != 0
        UNION ALL
        SELECT 'P3' AS Area, @P3_Amount AS Amount WHERE @P3_Amount != 0
        UNION ALL
        SELECT 'Support Measure' AS Area, @Support_Amount AS Amount WHERE @Support_Amount != 0
        UNION ALL
        -- Add Remaining Amount row only if there's a difference and it's not zero
        SELECT 'Remaining Amount' AS Area, @Remaining_Amount AS Amount WHERE @Remaining_Amount != 0
    ) AS ChartData
    ORDER BY 
        CASE Area
            WHEN 'P1' THEN 1
            WHEN 'P2' THEN 2
            WHEN 'P3' THEN 3
            WHEN 'Support Measure' THEN 4
            WHEN 'Remaining Amount' THEN 5
        END;
END