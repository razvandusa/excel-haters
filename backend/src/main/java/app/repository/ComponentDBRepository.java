package app.repository;

import app.domain.Component;
import app.domain.Flight;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ComponentDBRepository {
    private String url;
    private String username;
    private String password;

    public ComponentDBRepository(String url, String username, String password) {
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
     * Save component to database
     * @param component Component to save
     */
    public void save(Component component) {
        String sql = "INSERT INTO component (terminal_id, name, type, active) VALUES (?, ?, ?, ?);";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, component.getTerminalId());
            ps.setString(2, component.getName());
            ps.setString(3, component.getType());
            ps.setBoolean(4, component.getActive());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error saving component to database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Update component in database. If component is not found, nothing happens.
     * @param component Component to update
     */
    public void update(Component component) {
        String sql = "UPDATE component SET terminal_id = ?, name = ?, type = ?, active = ? WHERE component_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, component.getTerminalId());
            ps.setString(2, component.getName());
            ps.setString(3, component.getType());
            ps.setBoolean(4, component.getActive());
            ps.setLong(5, component.getId());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error updating component in database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Delete component from database. If component is not found, nothing happens.
     * @param id Component id to delete
     */
    public void deleteById(Long id) {
        String sql = "DELETE FROM component WHERE component_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error deleting component from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Find component by id. If component is not found, null is returned.
     * @param id Component id to find
     * @return Component object if found, null otherwise
     */
    public Component findById(Long id) {
        String sql = "SELECT * FROM component WHERE component_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
            PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Long terminalId = rs.getLong("terminal_id");
                String name = rs.getString("name");
                String type = rs.getString("type");
                Boolean active = rs.getBoolean("active");
                return new Component(terminalId, name, type, active);
            }
        } catch (SQLException e) {
            System.out.println("Error finding component from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return null;
    }

    /**
     * Find component by name. If component is not found, null is returned.
     * @param name Component name to find
     * @return Component object if found, null otherwise
     */
    public Component findByName(String name) {
        String sql = "SELECT * FROM component WHERE name = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, name);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Long terminalId = rs.getLong("terminal_id");
                String Name = rs.getString("name");
                String type = rs.getString("type");
                Boolean active = rs.getBoolean("active");
                return new Component(terminalId, Name, type, active);
            }
        } catch (SQLException e) {
            System.out.println("Error finding component from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return null;
    }

    /**
     * Get all components from database
     * @return List of all components
     */
    public List<Component> getAll() {
        String sql = "SELECT * FROM component;";
        List<Component> components = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Long terminalId = rs.getLong("terminal_id");
                String name = rs.getString("name");
                String type = rs.getString("type");
                Boolean active = rs.getBoolean("active");
                components.add(new Component(terminalId, name, type, active));
            }
        } catch (SQLException e) {
            System.out.println("Error getting all components from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return components;
    }
}
