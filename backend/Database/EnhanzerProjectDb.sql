/*
    Enhanzer Project - SQL Server database script

    Creates the EnhanzerProjectDb database with:
      - Location_Details     : locations returned by the external login API (User_Locations).
      - Purchase_Bill_Items  : items added through the Purchase Bill page.

    Rows in both tables are scoped by Company_Code (the email used to log in),
    so each account only sees its own locations and purchase bill items.

    The script is idempotent and can be run more than once.
*/

IF DB_ID(N'EnhanzerProjectDb') IS NULL
    CREATE DATABASE EnhanzerProjectDb;
GO

USE EnhanzerProjectDb;
GO

IF OBJECT_ID(N'dbo.Location_Details', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Location_Details (
        Id            INT IDENTITY(1,1) NOT NULL,
        Company_Code  NVARCHAR(254)     NOT NULL,
        Location_Code NVARCHAR(50)      NOT NULL,
        Location_Name NVARCHAR(200)     NOT NULL,
        CONSTRAINT PK_Location_Details PRIMARY KEY (Id),
        CONSTRAINT UQ_Location_Details_Company_Location UNIQUE (Company_Code, Location_Code)
    );
END
GO

IF OBJECT_ID(N'dbo.Purchase_Bill_Items', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Purchase_Bill_Items (
        Id                  INT IDENTITY(1,1) NOT NULL,
        Company_Code        NVARCHAR(254)     NOT NULL,
        Item_Name           NVARCHAR(100)     NOT NULL,
        Batch_Location_Code NVARCHAR(50)      NOT NULL,
        Standard_Cost       DECIMAL(18,2)     NOT NULL,
        Standard_Price      DECIMAL(18,2)     NOT NULL,
        Quantity            INT               NOT NULL,
        Free_Quantity       INT               NOT NULL,
        Discount_Percent    DECIMAL(5,2)      NOT NULL,
        Total_Cost          DECIMAL(18,2)     NOT NULL,
        Total_Selling       DECIMAL(18,2)     NOT NULL,
        Created_At_Utc      DATETIME2         NOT NULL,
        CONSTRAINT PK_Purchase_Bill_Items PRIMARY KEY (Id),
        CONSTRAINT FK_Purchase_Bill_Items_Location_Details
            FOREIGN KEY (Company_Code, Batch_Location_Code)
            REFERENCES dbo.Location_Details (Company_Code, Location_Code),
        CONSTRAINT CK_Purchase_Bill_Items_Quantity CHECK (Quantity >= 1),
        CONSTRAINT CK_Purchase_Bill_Items_Free_Quantity CHECK (Free_Quantity >= 0),
        CONSTRAINT CK_Purchase_Bill_Items_Discount_Percent CHECK (Discount_Percent BETWEEN 0 AND 100)
    );

    CREATE INDEX IX_Purchase_Bill_Items_Company_Code_Batch_Location_Code
        ON dbo.Purchase_Bill_Items (Company_Code, Batch_Location_Code);
END
GO
