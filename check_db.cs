using Microsoft.Data.SqlClient;
using System;

string connectionString = "Server=.;Database=RentalManagement;Trusted_Connection=True;TrustServerCertificate=True";
try {
    using (var connection = new SqlConnection(connectionString)) {
        connection.Open();
        string[] tables = { "AspNetUsers", "Rentals", "EmployeeFinancialAccounts" };
        foreach (var table in tables) {
            using (var command = new SqlCommand($"SELECT COUNT(*) FROM {table}", connection)) {
                var count = command.ExecuteScalar();
                Console.WriteLine($"{table}: {count}");
            }
        }
    }
} catch (Exception ex) {
    Console.WriteLine("Error: " + ex.Message);
}
