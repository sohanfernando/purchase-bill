/*
    Enhanzer Project - SQL Server database script

    Creates the EnhanzerProjectDb database with:
      - Location_Details     : locations returned by the external login API (User_Locations).
      - Purchase_Orders      : a saved purchase order (net amount and item count).
      - Purchase_Order_Items : the lines of an order.

    Rows in every table are scoped by Company_Code (the email used to log in),
    so each account only sees its own locations and orders.

    The script is idempotent and can be run more than once.

    Google Cloud SQL for SQL Server: connect with SSMS as the sqlserver user and run the
    script as-is; it creates the database and all tables.
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

IF OBJECT_ID(N'dbo.Purchase_Orders', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Purchase_Orders (
        Id             INT IDENTITY(1,1) NOT NULL,
        Company_Code   NVARCHAR(254)     NOT NULL,
        Net_Amount     DECIMAL(18,2)     NOT NULL,
        Item_Count     INT               NOT NULL,
        Created_At_Utc DATETIME2         NOT NULL,
        CONSTRAINT PK_Purchase_Orders PRIMARY KEY (Id),
        CONSTRAINT CK_Purchase_Orders_Item_Count CHECK (Item_Count >= 1)
    );

    -- The dashboard reads the newest orders of one company.
    CREATE INDEX IX_Purchase_Orders_Company_Code_Created_At_Utc
        ON dbo.Purchase_Orders (Company_Code, Created_At_Utc);
END
GO

IF OBJECT_ID(N'dbo.Purchase_Order_Items', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Purchase_Order_Items (
        Id                  INT IDENTITY(1,1) NOT NULL,
        Purchase_Order_Id   INT               NOT NULL,
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
        CONSTRAINT PK_Purchase_Order_Items PRIMARY KEY (Id),
        CONSTRAINT FK_Purchase_Order_Items_Purchase_Orders
            FOREIGN KEY (Purchase_Order_Id) REFERENCES dbo.Purchase_Orders (Id)
            ON DELETE CASCADE,
        CONSTRAINT FK_Purchase_Order_Items_Location_Details
            FOREIGN KEY (Company_Code, Batch_Location_Code)
            REFERENCES dbo.Location_Details (Company_Code, Location_Code),
        CONSTRAINT CK_Purchase_Order_Items_Quantity CHECK (Quantity >= 1),
        CONSTRAINT CK_Purchase_Order_Items_Free_Quantity CHECK (Free_Quantity >= 0),
        CONSTRAINT CK_Purchase_Order_Items_Discount_Percent CHECK (Discount_Percent BETWEEN 0 AND 100)
    );

    CREATE INDEX IX_Purchase_Order_Items_Purchase_Order_Id
        ON dbo.Purchase_Order_Items (Purchase_Order_Id);

    CREATE INDEX IX_Purchase_Order_Items_Company_Code_Batch_Location_Code
        ON dbo.Purchase_Order_Items (Company_Code, Batch_Location_Code);

    -- The donut widget groups a company's lines by item name.
    CREATE INDEX IX_Purchase_Order_Items_Company_Code_Item_Name
        ON dbo.Purchase_Order_Items (Company_Code, Item_Name);
END
GO
