CREATE PROCEDURE SP_GET_TOP_AGENCIES
    @YearRange NVARCHAR(20) = NULL,  -- Optional: '2021-2024', '2025-2027', '2021-2027'
    @Category NVARCHAR(100) = NULL   -- Optional: CAD Category filter
AS
BEGIN
    --DECLARE  @YearRange NVARCHAR(20) = '2021-2027', -- UI Options: '2021-2024', '2025-2027', '2021-2027'
    --@Category NVARCHAR(100) = 'Education'  

    SELECT 
        CASE 
            WHEN p.YEAR BETWEEN 2021 AND 2024 THEN '2021-2024'
            WHEN p.YEAR BETWEEN 2025 AND 2027 THEN '2025-2027'
            WHEN p.YEAR BETWEEN 2021 AND 2027 THEN '2021-2027'
            ELSE 'Other'
        END AS YearRange,
        imd.Agence AS Agency,
        c.CATEGORY AS Category,
        SUM(
            CASE 
                WHEN ISNUMERIC(REPLACE(REPLACE(imd.Indirect_Management_Amount, ' ', ''), ',', '')) = 1 
                THEN CAST(REPLACE(REPLACE(imd.Indirect_Management_Amount, ' ', ''), ',', '') AS BIGINT)
                ELSE 0
            END
        ) AS IndirectAmount,
        COUNT(*) AS ProjectCount
    FROM Indirect_Management_Data imd
    INNER JOIN PROJECTS p ON imd.Filename = p.FILENAME
    INNER JOIN CAD c ON imd.Filename = c.FILENAME
    WHERE p.YEAR IS NOT NULL
        AND (@YearRange IS NULL OR 
             (@YearRange = '2021-2024' AND p.YEAR BETWEEN 2021 AND 2024) OR
             (@YearRange = '2025-2027' AND p.YEAR BETWEEN 2025 AND 2027) OR
             (@YearRange = '2021-2027' AND p.YEAR BETWEEN 2021 AND 2027))
        AND (@Category IS NULL OR c.CATEGORY = @Category)
    GROUP BY 
        CASE 
            WHEN p.YEAR BETWEEN 2021 AND 2024 THEN '2021-2024'
            WHEN p.YEAR BETWEEN 2025 AND 2027 THEN '2025-2027'
            WHEN p.YEAR BETWEEN 2021 AND 2027 THEN '2021-2027'
            ELSE 'Other'
        END,
        imd.Agence,
        c.CATEGORY
    ORDER BY 
        SUM(
            CASE 
                WHEN ISNUMERIC(REPLACE(REPLACE(imd.Indirect_Management_Amount, ' ', ''), ',', '')) = 1 
                THEN CAST(REPLACE(REPLACE(imd.Indirect_Management_Amount, ' ', ''), ',', '') AS BIGINT)
                ELSE 0
            END
        ) DESC;
END

