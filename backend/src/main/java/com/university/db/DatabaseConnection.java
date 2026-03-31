package com.university.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.io.InputStream;
import java.util.Properties;

public class DatabaseConnection {

    private static String URL;
    private static String USER;
    private static String PASSWORD;
    private static Connection connection = null;

    static {
        try (InputStream input = DatabaseConnection.class
                .getClassLoader()
                .getResourceAsStream("application.properties")) {
            Properties props = new Properties();
            props.load(input);
            URL      = props.getProperty("spring.datasource.url");
            USER     = props.getProperty("spring.datasource.username");
            PASSWORD = props.getProperty("spring.datasource.password");
        } catch (Exception e) {
            throw new ExceptionInInitializerError("Failed to load DB config from application.properties: " + e.getMessage());
        }
    }

    private DatabaseConnection() {}

    public static Connection getConnection() throws SQLException {
        if (connection == null || connection.isClosed()) {
            try {
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
