


IF NOT EXISTS (
    select * from sysobjects where name='Indirect_Management_Data' and xtype='U'
) CREATE TABLE [Indirect_Management_Data] (

    ID INT IDENTITY(1,1) PRIMARY KEY,
    [Filename] NVARCHAR(100),
    [Agence] NVARCHAR(100),
    [Indirect_Management_Amount] NVARCHAR(20),
	 CREATED_DATE DATETIME NOT NULL DEFAULT GETDATE(),
    CREATED_BY NVARCHAR(100) NOT NULL DEFAULT 'Initial upload',
    UPDATED_DATE DATETIME,
    UPDATED_BY NVARCHAR(100)
);
INSERT INTO [Indirect_Management_Data](
[Filename] ,
    [Agence] ,
    [Indirect_Management_Amount] 
) VALUES (N'C_2023_8229_F1_ANNEX_EN_V3_P1_3116610_p3.txt',N'an entrusted entity',N'4 200 000'),
	(N'C_2023_8229_F1_ANNEX_EN_V3_P1_3116610_p3.txt',N'an entrusted entity',N'5 300 000'),
	(N'C_2021_9375_F1_ANNEX_EN_V2_P1_1629790_p3.txt',N'Belize',N'400 000'),
	(N'C_2021_9284_F1_ANNEX_EN_V1_P1_1674789_p3.txt',N'or international organisation',N'1 400 000'),
	(N'C_2023_3234_F1_ANNEX_EN_V2_P1_2692090_p3.txt',N'United Nations Development Programme',N'3 000 000'),
	(N'C_2023_3234_F1_ANNEX_EN_V2_P1_2692090_p3.txt',N'GIZ',N'8 000 000'),
	(N'C_2023_3234_F1_ANNEX_EN_V2_P1_2692091_p3.txt',N'United Nations Development Programme',N'800 000'),
	(N'C_2023_3234_F1_ANNEX_EN_V2_P1_2692091_p3.txt',N'United Nations for Women',N'1 000 000'),
	(N'C_2023_8516_F1_ANNEX_EN_V3_P1_3109150_p3.txt',N'AECID (Spain)',N'3 000 000'),
	(N'C_2023_8516_F1_ANNEX_EN_V3_P1_3109150_p3.txt',N'AICS (Italy)',N'2 000 000'),
	(N'C_2021_9377_F1_ANNEX_EN_V3_P1_1652130_p3.txt',N'the Government of Honduras',N'1 300 000'),
	(N'C_2023_5548_F1_ANNEX_EN_V3_P1_2814170_p3.txt',N'an entrusted entity',N'8 000 000'),
	(N'C_2023_5548_F1_ANNEX_EN_V3_P1_2814170_p3.txt',N'an entrusted entity',N'8 000 000'),
	(N'C_2024_8508_F1_ANNEX_EN_V2_P1_3776636_p3.txt',N'UNODC',N'0'),
	(N'C_2024_8508_F1_ANNEX_EN_V2_P1_3776636_p3.txt',N'UNODC',N'0'),
	(N'C_2021_9369_F1_ANNEX_EN_V1_P1_1587790_p3.txt',N'an international organisation',N'20 000 000'),
	(N'C_2021_9369_F1_ANNEX_EN_V1_P1_1587790_p3.txt',N'international organisations',N'24 000 000'),
	(N'C_2021_9369_F1_ANNEX_EN_V1_P1_1587790_p3.txt',N'international organisations',N'25 000 000'),
	(N'C_2021_9369_F1_ANNEX_EN_V1_P1_1587790_p3.txt',N'an international organisation',N'5 200 000'),
	(N'C_2024_7927_F1_ANNEX_EN_V2_P1_3684475_p3.txt',N'IDB (Objective 2',N'900 000'),
	(N'C_2021_9371_F1_ANNEX_EN_V1_P1_1629290_p3.txt',N'Jamaica',N'150 000'),
	(N'C_2021_9371_F1_ANNEX_EN_V1_P1_1629290_p3.txt',N'Jamaica',N'430 000'),
	(N'C_2024_8839_F1_ANNEX_EN_V2_P1_3818569_p3.txt',N'an entrusted entity',N'2 700 000'),
	(N'C_2024_5528_F1_ANNEX_EN_V3_P1_3568075_p3.txt',N'a pillar',N'3 000 000'),
	(N'C_2024_7935_F1_ANNEX_EN_V2_P1_3724777_p3.txt',N'an entrusted entity',N'0'),
	(N'C_2024_5861_F1_ANNEX_EN_V2_P1_3616915_p3.txt',N'a MS/ international organisation',N'5 400 000'),
	(N'C_2021_9286_F1_ANNEX_EN_V2_P1_1662269_p3.txt',N'a MS/ international organisation',N'1 000 000'),
	(N'C_2024_8840_F1_ANNEX_EN_V2_P1_3818589_p3.txt',N'an entrusted entity',N'2 700 000');
	
	Select Count(*) from Indirect_Management_Data
	


