package app.repository;
import app.domain.Terminal;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class TerminalDBRepository {
    private String url;
    private String username;
    private String password;

    public TerminalDBRepository(String url, String username, String password) {
        this.url = url;
        this.username = username;
        this.password = password;
        try (Connection conn = DriverManager.getConnection(url, username, password)) {
            System.out.println("Connection to database successful");
        } catch (SQLException e) {
            System.out.println("Connection to database failed");
            System.out.println(e.getMessage());
        }
    }

    /**
     * Save terminal to database
     * @param terminal Terminal to save
     */
    public void save(Terminal terminal) {
        String sql = "INSERT INTO terminal (name, active) VALUES (?, ?);";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, terminal.getName());
            ps.setBoolean(2, terminal.getActive());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error saving terminal to database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Update terminal in database. If terminal is not found, nothing happens.
     * @param terminal Terminal to update
     */
    public void update(Terminal terminal) {
        String sql = "UPDATE terminal SET name = ?, active = ? WHERE terminal_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, terminal.getName());
            ps.setBoolean(2, terminal.getActive());
            ps.setLong(3, terminal.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error updating terminal in database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Delete terminal from database. If terminal is not found, nothing happens.
     * @param id Terminal id to delete
     */
    public void deleteById(Long id) {
        String sql = "DELETE FROM terminal WHERE terminal_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error deleting terminal from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Find terminal by id. If terminal is not found, null is returned.
     * @param id Terminal id to find
     * @return Terminal object if found, null otherwise
     */
    public Terminal findById(Long id) {
        String sql = "SELECT * FROM terminal WHERE terminal_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
            PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                String name = rs.getString("name");
                Boolean active = rs.getBoolean("active");
                return new Terminal(name, active);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching terminal from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return null;
    }

    /**
     * Find terminal by name. If terminal is not found, null is returned.
     * @param terminalName Terminal name to find
     * @return Terminal object if found, null otherwise
     */
    public Terminal findByName(String terminalName) {
        String sql = "SELECT * FROM terminal WHERE name = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, terminalName);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Boolean active = rs.getBoolean("active");
                return new Terminal(terminalName, active);
            }
        } catch (SQLException e) {
            System.out.println("Error fetching terminal from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return null;
    }

    /**
     * Get all terminals from database
     * @return List of all terminals
     */
    public List<Terminal> getAll() {
        String sql = "SELECT * FROM terminal;";
        List<Terminal> terminals = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                String name = rs.getString("name");
                Boolean active = rs.getBoolean("active");
                terminals.add(new Terminal(name, active));
            }
        } catch (SQLException e) {
            System.out.println("Error getting all terminals from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return terminals;
    }
}
