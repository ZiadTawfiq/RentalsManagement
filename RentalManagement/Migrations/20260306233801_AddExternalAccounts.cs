using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExternalAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ExternalTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalAccountId = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Currency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProofImagePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PerformedById = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExternalTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExternalTransactions_AspNetUsers_PerformedById",
                        column: x => x.PerformedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ExternalTransactions_ExternalAccounts_ExternalAccountId",
                        column: x => x.ExternalAccountId,
                        principalTable: "ExternalAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExternalTransactions_ExternalAccountId",
                table: "ExternalTransactions",
                column: "ExternalAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_ExternalTransactions_PerformedById",
                table: "ExternalTransactions",
                column: "PerformedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExternalTransactions");

            migrationBuilder.DropTable(
                name: "ExternalAccounts");
        }
    }
}
