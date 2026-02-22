using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalManagement.Migrations
{
    /// <inheritdoc />
    public partial class CampaignMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "campainId",
                table: "Rentals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "Rentals",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Campain",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campain", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_campainId",
                table: "Rentals",
                column: "campainId");

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_Campain_campainId",
                table: "Rentals",
                column: "campainId",
                principalTable: "Campain",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_Campain_campainId",
                table: "Rentals");

            migrationBuilder.DropTable(
                name: "Campain");

            migrationBuilder.DropIndex(
                name: "IX_Rentals_campainId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "campainId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "status",
                table: "Rentals");
        }
    }
}
