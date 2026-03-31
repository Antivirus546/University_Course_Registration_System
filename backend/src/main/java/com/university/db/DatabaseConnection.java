package com.university.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {

    // IMPORTANT: Update these credentials with your local Oracle settings
    private static final String URL = "jdbc:oracle:thin:@192.168.0.195:1521:XE"; // Updated to match listener binding
    private static final String USER = "SYSTEM"; // Or whatever your oracle username is
    private static final String PASSWORD = "123"; 

    private static Connection connection = null;

    private DatabaseConnection() {
        // Private constructor to prevent instantiation
    }

    public static Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            try {
                // Registering the driver is optional in modern JDBC, but good for explicit Oracle setups
                Class.forName("oracle.jdbc.OracleDriver");
                connection = DriverManager.getConnection(URL, USER, PASSWORD);
                System.out.println("Database Connected successfully.");
            } catch (ClassNotFoundException e) {
                System.err.println("Oracle JDBC Driver not found.");
                e.printStackTrace();
            }
        }
        return connection;
    }
}
