using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace RentalManagement.Migrations
{
    /// <inheritdoc />
    public partial class UpdateEmployeeFinancialAccounts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Movement",
                table: "EmployeeTransactions",
                newName: "Type");

            migrationBuilder.RenameColumn(
                name: "Salary",
                table: "EmployeeFinancialAccounts",
                newName: "TotalBonusBalance");

            migrationBuilder.RenameColumn(
                name: "BonusBalance",
                table: "EmployeeFinancialAccounts",
                newName: "SalaryForCurrentMonth");

            migrationBuilder.AddColumn<int>(
                name: "FinancialAccountId",
                table: "EmployeeTransactions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RemainingBonusBalance",
                table: "EmployeeFinancialAccounts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "RemainingCommission",
                table: "EmployeeFinancialAccounts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "RemainingMonthlySalary",
                table: "EmployeeFinancialAccounts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeTransactions_FinancialAccountId",
                table: "EmployeeTransactions",
                column: "FinancialAccountId");

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeTransactions_FinancialAccounts_FinancialAccountId",
                table: "EmployeeTransactions",
                column: "FinancialAccountId",
                principalTable: "FinancialAccounts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeTransactions_FinancialAccounts_FinancialAccountId",
                table: "EmployeeTransactions");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeTransactions_FinancialAccountId",
                table: "EmployeeTransactions");

            migrationBuilder.DropColumn(
                name: "FinancialAccountId",
                table: "EmployeeTransactions");

            migrationBuilder.DropColumn(
                name: "RemainingBonusBalance",
                table: "EmployeeFinancialAccounts");

            migrationBuilder.DropColumn(
                name: "RemainingCommission",
                table: "EmployeeFinancialAccounts");

            migrationBuilder.DropColumn(
                name: "RemainingMonthlySalary",
                table: "EmployeeFinancialAccounts");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "EmployeeTransactions",
                newName: "Movement");

            migrationBuilder.RenameColumn(
                name: "TotalBonusBalance",
                table: "EmployeeFinancialAccounts",
                newName: "Salary");

            migrationBuilder.RenameColumn(
                name: "SalaryForCurrentMonth",
                table: "EmployeeFinancialAccounts",
                newName: "BonusBalance");
        }
    }
}
