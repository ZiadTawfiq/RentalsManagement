using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalManagement.Migrations
{
    /// <inheritdoc />
    public partial class migration001 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "CampainMoney",
                table: "RentalSettlements",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CampainMoney",
                table: "RentalSettlements");
        }
    }
}
