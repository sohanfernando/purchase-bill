using EnhanzerProject.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace EnhanzerProject.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<LocationDetail> LocationDetails => Set<LocationDetail>();
    public DbSet<PurchaseBillItem> PurchaseBillItems => Set<PurchaseBillItem>();

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

        modelBuilder.Entity<PurchaseBillItem>(entity =>
        {
            entity.ToTable("Purchase_Bill_Items", table =>
            {
                table.HasCheckConstraint("CK_Purchase_Bill_Items_Quantity", "[Quantity] >= 1");
                table.HasCheckConstraint("CK_Purchase_Bill_Items_Free_Quantity", "[Free_Quantity] >= 0");
                table.HasCheckConstraint("CK_Purchase_Bill_Items_Discount_Percent", "[Discount_Percent] BETWEEN 0 AND 100");
            });
            entity.HasKey(item => item.Id);
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

            entity.HasOne(item => item.BatchLocation)
                .WithMany()
                .HasForeignKey(item => new { item.CompanyCode, item.BatchLocationCode })
                .HasPrincipalKey(location => new { location.CompanyCode, location.LocationCode })
                .HasConstraintName("FK_Purchase_Bill_Items_Location_Details")
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
