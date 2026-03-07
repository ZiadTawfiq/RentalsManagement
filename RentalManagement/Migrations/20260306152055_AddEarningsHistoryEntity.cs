using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddEarningsHistoryEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EarningsHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeFinancialAccountId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PerformedById = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EarningsHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EarningsHistories_AspNetUsers_PerformedById",
                        column: x => x.PerformedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EarningsHistories_EmployeeFinancialAccounts_EmployeeFinancialAccountId",
                        column: x => x.EmployeeFinancialAccountId,
                        principalTable: "EmployeeFinancialAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EarningsHistories_EmployeeFinancialAccountId",
                table: "EarningsHistories",
                column: "EmployeeFinancialAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_EarningsHistories_PerformedById",
                table: "EarningsHistories",
                column: "PerformedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EarningsHistories");
        }
    }
}
