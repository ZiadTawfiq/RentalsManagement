using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalManagement.Migrations
{
    /// <inheritdoc />
    public partial class SeedCampaignTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Campain",
                columns: ["Id", "Type"],
                values: new object[,]
                {
                    { 1, "Facebook" },
                    { 2, "WhatsApp" },
                    { 3, "Instagram" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(table: "Campain", keyColumn: "Id", keyValues: [1, 2, 3]);
        }
    }
}
