using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalManagement.Migrations
{
    /// <inheritdoc />
    public partial class EditMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_AspNetUsers_SalesRepresentativeId",
                table: "Rentals");

            migrationBuilder.DropIndex(
                name: "IX_Rentals_SalesRepresentativeId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "SalesRepresentativeId",
                table: "Rentals");

            migrationBuilder.AlterColumn<decimal>(
                name: "CompanyRevenue",
                table: "RentalSettlements",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "CompanyRevenue",
                table: "RentalSettlements",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SalesRepresentativeId",
                table: "Rentals",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_SalesRepresentativeId",
                table: "Rentals",
                column: "SalesRepresentativeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_AspNetUsers_SalesRepresentativeId",
                table: "Rentals",
                column: "SalesRepresentativeId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
