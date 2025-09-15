CREATE PROCEDURE [dbo].[SP_GetTopPrograms]
    @YearRange NVARCHAR(20) = '2021-2027', -- UI Options: '2021-2024', '2025-2027', '2021-2027'
    @Category NVARCHAR(100) = NULL         -- Single Category selection (optional)
AS
BEGIN
    SET NOCOUNT ON;
    --   DECLARE  @YearRange NVARCHAR(20) = '2021-2027', -- UI Options: '2021-2024', '2025-2027', '2021-2027'
    --@Category NVARCHAR(100) = 'Education'  

    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @CategoryFilter NVARCHAR(MAX) = '';
    DECLARE @YearFilter NVARCHAR(MAX) = '';
    
    -- Build Category filter if provided (single Category only)
    IF @Category IS NOT NULL AND @Category != ''
    BEGIN
        SET @CategoryFilter = ' AND c.CATEGORY = ''' + @Category + '''';
    END
    
    -- Build year filter based on selected range
    SET @YearFilter = CASE 
        WHEN @YearRange = '2021-2024' THEN ' AND p.[YEAR] BETWEEN 2021 AND 2024'
        WHEN @YearRange = '2025-2027' THEN ' AND p.[YEAR] BETWEEN 2025 AND 2027'  
        WHEN @YearRange = '2021-2027' THEN ' AND p.[YEAR] BETWEEN 2021 AND 2027'
        ELSE ' AND p.[YEAR] BETWEEN 2021 AND 2027' -- Default fallback
    END;
    
    SET @SQL = '
    SELECT 
        --p.ID,
        --p.PROJECTGUID,
        --p.COUNTRY,
        --p.[YEAR],
        p.ACTION_TITLE As Program,
        --p.ANNUAL_ACTION_TITLE,
        --p.FILENAME,
        p.COLUMN_1_3_1_TOTAL_AMOUNT As TotalAmount,
        --c.CODE_CAD,
        --c.NAME as CAD_NAME,
        c.CATEGORY as Category ,
        ''' + @YearRange + ''' as YearRange
        --''' + ISNULL(@Category, 'ALL') + ''' as APPLIED_CATEGORY
    FROM [PROJECTS] p
    INNER JOIN [CAD] c ON p.FILENAME = c.FILENAME
    WHERE 1=1 
        ' + @YearFilter + '
        ' + @CategoryFilter + '
        AND p.COUNTRY IS NOT NULL
        AND p.ACTION_TITLE IS NOT NULL
    ORDER BY p.COUNTRY, p.[YEAR], p.ACTION_TITLE;
    ';
    
    EXEC sp_executesql @SQL;
END;
GO