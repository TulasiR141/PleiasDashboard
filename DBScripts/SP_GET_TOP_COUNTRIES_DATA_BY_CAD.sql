

	CREATE PROCEDURE [dbo].[SP_GET_TOP_COUNTRIES_DATA_BY_CAD]
    @YearRange NVARCHAR(20) = '2021-2027', -- UI Options: '2021-2024', '2025-2027', '2021-2027'
    @Category NVARCHAR(100) = NULL         -- Single Category selection (optional)
AS
BEGIN 
    SET NOCOUNT ON;
    -- DECLARE  @YearRange NVARCHAR(20) = '2021-2027', -- UI Options: '2021-2024', '2025-2027', '2021-2027'
    --@Category NVARCHAR(100) = 'Communications'  


    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @CategoryFilter NVARCHAR(MAX) = '';
    DECLARE @YearFilter NVARCHAR(MAX) = '';
    DECLARE @MIPYearFilter NVARCHAR(MAX) = '';
    
    -- Build Category filter if provided (single Category only)
    IF @Category IS NOT NULL AND @Category != ''
    BEGIN
        SET @CategoryFilter = ' AND c.CATEGORY = ''' + @Category + '''';
    END
    
    -- Build year filter based on selected range
    -- UI will always provide one of the 3 options: 2021-2024, 2025-2027, or 2021-2027
    SET @YearFilter = CASE 
        WHEN @YearRange = '2021-2024' THEN ' AND p.[YEAR] BETWEEN 2021 AND 2024'
        WHEN @YearRange = '2025-2027' THEN ' AND p.[YEAR] BETWEEN 2025 AND 2027'  
        WHEN @YearRange = '2021-2027' THEN ' AND p.[YEAR] BETWEEN 2021 AND 2027'
        ELSE ' AND p.[YEAR] BETWEEN 2021 AND 2027' -- Default fallback
    END;
    
    -- Build MIP year filter for projected data based on selected range
    SET @MIPYearFilter = CASE 
        WHEN @YearRange = '2021-2024' THEN 'ISNULL(m.P1_AMOUNT_21_24, 0) + ISNULL(m.P2_AMOUNT_21_24, 0) + ISNULL(m.P3_AMOUNT_21_24, 0) + ISNULL(m.SUPPORT_MEASURES_AMOUNT_21_24, 0)'
        WHEN @YearRange = '2025-2027' THEN 'ISNULL(m.P1_AMOUNT_25_27, 0) + ISNULL(m.P2_AMOUNT_25_27, 0) + ISNULL(m.P3_AMOUNT_25_27, 0) + ISNULL(m.SUPPORT_MEASURES_AMOUNT_25_27, 0)'
        WHEN @YearRange = '2021-2027' THEN 'ISNULL(m.P1_AMOUNT_21_24, 0) + ISNULL(m.P1_AMOUNT_25_27, 0) + ISNULL(m.P2_AMOUNT_21_24, 0) + ISNULL(m.P2_AMOUNT_25_27, 0) + ISNULL(m.P3_AMOUNT_21_24, 0) + ISNULL(m.P3_AMOUNT_25_27, 0) + ISNULL(m.SUPPORT_MEASURES_AMOUNT_21_24, 0) + ISNULL(m.SUPPORT_MEASURES_AMOUNT_25_27, 0)'
        ELSE 'ISNULL(m.P1_AMOUNT_21_24, 0) + ISNULL(m.P1_AMOUNT_25_27, 0) + ISNULL(m.P2_AMOUNT_21_24, 0) + ISNULL(m.P2_AMOUNT_25_27, 0) + ISNULL(m.P3_AMOUNT_21_24, 0) + ISNULL(m.P3_AMOUNT_25_27, 0) + ISNULL(m.SUPPORT_MEASURES_AMOUNT_21_24, 0) + ISNULL(m.SUPPORT_MEASURES_AMOUNT_25_27, 0)' -- Default fallback
    END;
    
    SET @SQL = '
    WITH EngagedData AS (
        -- Get Engaged funding data from PROJECTS table with CAD category filtering
        SELECT 
            p.COUNTRY,
            SUM(ISNULL(p.COLUMN_1_3_1_TOTAL_AMOUNT, 0)) as ENGAGED_TOTAL_AMOUNT
        FROM [PROJECTS] p
        INNER JOIN [CAD] c ON p.FILENAME = c.FILENAME
        WHERE 1=1 
            ' + @YearFilter + '
            ' + @CategoryFilter + '
            AND p.COUNTRY IS NOT NULL
            AND p.COLUMN_1_3_1_TOTAL_AMOUNT IS NOT NULL
        GROUP BY p.COUNTRY
    ),
    FilteredCountries AS (
        -- Get unique countries from engaged data (after CAD filtering)
        SELECT DISTINCT COUNTRY 
        FROM EngagedData
        WHERE ENGAGED_TOTAL_AMOUNT > 0
    ),
    ProjectedData AS (
        -- Get Projected funding data ONLY for countries that have engaged data
        -- This ensures category filtering is applied consistently
        SELECT 
            m.COUNTRY,
            SUM(' + @MIPYearFilter + ') as PROJECTED_TOTAL_AMOUNT
        FROM [MIP_DATA] m
        INNER JOIN FilteredCountries fc ON m.COUNTRY = fc.COUNTRY
        WHERE m.COUNTRY IS NOT NULL
        GROUP BY m.COUNTRY
    ),
    AllCountries AS (
        -- Get all unique countries from filtered engaged data
        SELECT DISTINCT COUNTRY FROM EngagedData
        UNION
        SELECT DISTINCT COUNTRY FROM ProjectedData
    )
    SELECT 
        ac.COUNTRY Country,
        ISNULL(e.ENGAGED_TOTAL_AMOUNT, 0) as EngagedAmount,
        ISNULL(p.PROJECTED_TOTAL_AMOUNT, 0) as ProjectedAmount,
        --(ISNULL(e.ENGAGED_TOTAL_AMOUNT, 0) + ISNULL(p.PROJECTED_TOTAL_AMOUNT, 0)) as COMBINED_TOTAL_AMOUNT,
        ''' + @YearRange + ''' as YearRange,
        ''' + ISNULL(@Category, 'ALL') + ''' as Category
    FROM AllCountries ac
    LEFT JOIN EngagedData e ON ac.COUNTRY = e.COUNTRY
    LEFT JOIN ProjectedData p ON ac.COUNTRY = p.COUNTRY
    WHERE (ISNULL(e.ENGAGED_TOTAL_AMOUNT, 0) > 0 OR ISNULL(p.PROJECTED_TOTAL_AMOUNT, 0) > 0)
    ORDER BY ac.COUNTRY;
    ';
    
    EXEC sp_executesql @SQL;
END;


