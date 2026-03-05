using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeFinancials : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedByEmployeeId",
                table: "Rentals",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EmployeeFinancialAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Salary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BaseMonthlySalary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CommissionBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    BonusBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LoanBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeFinancialAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeFinancialAccounts_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeTransactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeFinancialAccountId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Movement = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PerformedById = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmployeeTransactions_AspNetUsers_PerformedById",
                        column: x => x.PerformedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_EmployeeTransactions_EmployeeFinancialAccounts_EmployeeFinancialAccountId",
                        column: x => x.EmployeeFinancialAccountId,
                        principalTable: "EmployeeFinancialAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_CreatedByEmployeeId",
                table: "Rentals",
                column: "CreatedByEmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeFinancialAccounts_UserId",
                table: "EmployeeFinancialAccounts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeTransactions_EmployeeFinancialAccountId",
                table: "EmployeeTransactions",
                column: "EmployeeFinancialAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeTransactions_PerformedById",
                table: "EmployeeTransactions",
                column: "PerformedById");

            migrationBuilder.AddForeignKey(
                name: "FK_Rentals_AspNetUsers_CreatedByEmployeeId",
                table: "Rentals",
                column: "CreatedByEmployeeId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Rentals_AspNetUsers_CreatedByEmployeeId",
                table: "Rentals");

            migrationBuilder.DropTable(
                name: "EmployeeTransactions");

            migrationBuilder.DropTable(
                name: "EmployeeFinancialAccounts");

            migrationBuilder.DropIndex(
                name: "IX_Rentals_CreatedByEmployeeId",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "CreatedByEmployeeId",
                table: "Rentals");
        }
    }
}
