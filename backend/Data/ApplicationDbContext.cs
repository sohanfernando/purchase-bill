using EnhanzerProject.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnhanzerProject.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<LocationDetail> LocationDetails => Set<LocationDetail>();
    public DbSet<PurchaseOrder> PurchaseOrders => Set<PurchaseOrder>();
    public DbSet<PurchaseOrderItem> PurchaseOrderItems => Set<PurchaseOrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LocationDetail>(entity =>
        {
            entity.ToTable("Location_Details");
            entity.HasKey(location => location.Id);
            entity.Property(location => location.CompanyCode).HasColumnName("Company_Code").HasMaxLength(254).IsRequired();
            entity.Property(location => location.LocationCode).HasColumnName("Location_Code").HasMaxLength(50).IsRequired();
            entity.Property(location => location.LocationName).HasColumnName("Location_Name").HasMaxLength(200).IsRequired();
            entity.HasAlternateKey(location => new { location.CompanyCode, location.LocationCode })
                .HasName("UQ_Location_Details_Company_Location");
        });

        modelBuilder.Entity<PurchaseOrder>(entity =>
        {
            entity.ToTable("Purchase_Orders", table =>
            {
                table.HasCheckConstraint("CK_Purchase_Orders_Item_Count", "[Item_Count] >= 1");
            });
            entity.HasKey(order => order.Id);
            entity.Property(order => order.CompanyCode).HasColumnName("Company_Code").HasMaxLength(254).IsRequired();
            entity.Property(order => order.NetAmount).HasColumnName("Net_Amount").HasPrecision(18, 2);
            entity.Property(order => order.ItemCount).HasColumnName("Item_Count");
            entity.Property(order => order.CreatedAtUtc)
                .HasColumnName("Created_At_Utc")
                .HasConversion(value => value, value => DateTime.SpecifyKind(value, DateTimeKind.Utc));

            // The dashboard asks for the newest orders of one company, so index exactly that.
            entity.HasIndex(order => new { order.CompanyCode, order.CreatedAtUtc })
                .HasDatabaseName("IX_Purchase_Orders_Company_Code_Created_At_Utc");
        });

        modelBuilder.Entity<PurchaseOrderItem>(entity =>
        {
            entity.ToTable("Purchase_Order_Items", table =>
            {
                table.HasCheckConstraint("CK_Purchase_Order_Items_Quantity", "[Quantity] >= 1");
                table.HasCheckConstraint("CK_Purchase_Order_Items_Free_Quantity", "[Free_Quantity] >= 0");
                table.HasCheckConstraint("CK_Purchase_Order_Items_Discount_Percent", "[Discount_Percent] BETWEEN 0 AND 100");
            });
            entity.HasKey(item => item.Id);
            entity.Property(item => item.PurchaseOrderId).HasColumnName("Purchase_Order_Id");
            entity.Property(item => item.CompanyCode).HasColumnName("Company_Code").HasMaxLength(254).IsRequired();
            entity.Property(item => item.ItemName).HasColumnName("Item_Name").HasMaxLength(100).IsRequired();
            entity.Property(item => item.BatchLocationCode).HasColumnName("Batch_Location_Code").HasMaxLength(50).IsRequired();
            entity.Property(item => item.StandardCost).HasColumnName("Standard_Cost").HasPrecision(18, 2);
            entity.Property(item => item.StandardPrice).HasColumnName("Standard_Price").HasPrecision(18, 2);
            entity.Property(item => item.Quantity).HasColumnName("Quantity");
            entity.Property(item => item.FreeQuantity).HasColumnName("Free_Quantity");
            entity.Property(item => item.DiscountPercent).HasColumnName("Discount_Percent").HasPrecision(5, 2);
            entity.Property(item => item.TotalCost).HasColumnName("Total_Cost").HasPrecision(18, 2);
            entity.Property(item => item.TotalSelling).HasColumnName("Total_Selling").HasPrecision(18, 2);
            // SQL Server's DATETIME2 has no time zone, so mark values read back as UTC.
            entity.Property(item => item.CreatedAtUtc)
                .HasColumnName("Created_At_Utc")
                .HasConversion(value => value, value => DateTime.SpecifyKind(value, DateTimeKind.Utc));

            // Deleting an order removes its lines.
            entity.HasOne(item => item.PurchaseOrder)
                .WithMany(order => order.Items)
                .HasForeignKey(item => item.PurchaseOrderId)
                .HasConstraintName("FK_Purchase_Order_Items_Purchase_Orders")
                .OnDelete(DeleteBehavior.Cascade);

            // The batch must be a location of the same company, which the composite key enforces.
            entity.HasOne(item => item.BatchLocation)
                .WithMany()
                .HasForeignKey(item => new { item.CompanyCode, item.BatchLocationCode })
                .HasPrincipalKey(location => new { location.CompanyCode, location.LocationCode })
                .HasConstraintName("FK_Purchase_Order_Items_Location_Details")
                .OnDelete(DeleteBehavior.Restrict);

            // The donut widget groups a company's lines by item name.
            entity.HasIndex(item => new { item.CompanyCode, item.ItemName })
                .HasDatabaseName("IX_Purchase_Order_Items_Company_Code_Item_Name");
        });
    }
}
