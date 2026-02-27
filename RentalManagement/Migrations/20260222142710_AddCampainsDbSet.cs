using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddCampainsDbSet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_Campain_campainId",
                table: "Rentals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Campain",
                table: "Campain");

            migrationBuilder.RenameTable(
                name: "Campain",
                newName: "Campains");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Campains",
                table: "Campains",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_Campains_campainId",
                table: "Rentals",
                column: "campainId",
                principalTable: "Campains",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_Campains_campainId",
                table: "Rentals");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Campains",
                table: "Campains");

            migrationBuilder.RenameTable(
                name: "Campains",
                newName: "Campain");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Campain",
                table: "Campain",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_Campain_campainId",
                table: "Rentals",
                column: "campainId",
                principalTable: "Campain",
                principalColumn: "Id");
        }
    }
}
