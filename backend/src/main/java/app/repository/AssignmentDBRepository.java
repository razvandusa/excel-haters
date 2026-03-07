package app.repository;

import app.domain.Assignment;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class AssignmentDBRepository {
    private String url;
    private String username;
    private String password;

    public AssignmentDBRepository(String url, String username, String password) {
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
     * Save assignment to database
     * @param assignment Assignment to save
     */
    public void save(Assignment assignment) {
        String sql = "INSERT INTO assignment (start, finish, component_id, flight_id) VALUES (?, ?, ?, ?);";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setTimestamp(1, Timestamp.valueOf(assignment.getStart()));
            ps.setTimestamp(2, Timestamp.valueOf(assignment.getEnd()));
            ps.setLong(3, assignment.getIdComponent());
            ps.setString(4, assignment.getIdFlight());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error saving assignment to database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Update assignment in database. If assignment is not found, nothing happens.
     * @param assignment Assignment to update
     */
    public void update(Assignment assignment) {
        //first delete the old assignment
        delete(assignment.getStart(), assignment.getEnd(), assignment.getIdComponent());
        save(new Assignment(assignment.getStart(), assignment.getEnd(), assignment.getIdComponent(), assignment.getIdFlight()));
    }

    /**
     * Delete assignment from database
     * @param start start time of assignment
     * @param finish finish time of assignment
     * @param componentId id of component
     */
    public void delete(LocalDateTime start, LocalDateTime finish, Long componentId) {
        String sql = "DELETE FROM assignment WHERE start = ? AND finish = ? AND component_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setTimestamp(1, Timestamp.valueOf(start));
            ps.setTimestamp(2, Timestamp.valueOf(finish));
            ps.setLong(3, componentId);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error deleting assignment from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Get all assignments from database
     * @return List of all assignments
     */
    public List<Assignment> getAll() {
        String sql = "SELECT * FROM assignment;";
        List<Assignment> assignments = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                LocalDateTime start = rs.getTimestamp("start").toLocalDateTime();
                LocalDateTime finish = rs.getTimestamp("finish").toLocalDateTime();
                Long componentId = rs.getLong("component_id");
                String flightId = rs.getString("flight_id");
                assignments.add(new Assignment(start, finish, componentId, flightId));
            }
        } catch (SQLException e) {
            System.out.println("Error getting all assignments from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return assignments;
    }
}
