package app.repository;

import app.domain.Flight;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Repository
public class FlightDBRepository {
    private String url;
    private String username;
    private String password;

    public FlightDBRepository(
            @Value("${db.url}") String url,
            @Value("${db.username}") String username,
            @Value("${db.password}") String password) {
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
     * Save flight to database
     * @param flight Flight to save
     */
    public void save(Flight flight) {

        String sql = "INSERT INTO flight (flight_id, terminal_name, arrival, departure, status) VALUES (?, ?, ?, ?, ?);";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, flight.getFlightId());
            ps.setString(2, flight.getTerminalName());
            if (flight.getDeparture() == null) {
                ps.setTimestamp(3, Timestamp.valueOf(flight.getArrival()));
                ps.setNull(4, Types.TIMESTAMP);
            } else {
                ps.setNull(3, Types.TIMESTAMP);
                ps.setTimestamp(4, Timestamp.valueOf(flight.getDeparture()));
            }
            ps.setString(5, flight.getStatus());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error saving flight to database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Update flight in database. If flight is not found, nothing happens.
     * @param flight Flight to update
     */
    public void update(Flight flight) {
        String sql = "UPDATE flight SET terminal_name = ?, arrival = ?, departure = ?, status = ? WHERE flight_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, flight.getTerminalName());
            ps.setTimestamp(2, Timestamp.valueOf(flight.getArrival()));
            ps.setTimestamp(3, Timestamp.valueOf(flight.getDeparture()));
            ps.setString(4, flight.getStatus());
            ps.setString(5, flight.getFlightId());
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error updating flight in database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Delete flight from database. If flight is not found, nothing happens.
     * @param flightId Flight id to delete
     */
    public void deleteById(String flightId) {
        String sql = "DELETE FROM flight WHERE flight_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, flightId);
            ps.executeUpdate();
        } catch (SQLException e) {
            System.out.println("Error deleting flight from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }

    /**
     * Find flight by id. If flight is not found, null is returned.
     * @param flightId Flight id to find
     * @return Flight object if found, null otherwise
     */
    public Flight findById(String flightId) {
        String sql = "SELECT * FROM flight WHERE flight_id = ?;";
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, flightId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                String flight_id = rs.getString("flight_id");
                String terminalName = rs.getString("terminal_name");
                LocalDateTime arrival = rs.getTimestamp("arrival").toLocalDateTime();
                LocalDateTime departure = rs.getTimestamp("departure").toLocalDateTime();
                String status = rs.getString("status");
                return new Flight(flight_id, terminalName, arrival, departure, status);
            }
        } catch (SQLException e) {
            System.out.println("Error finding flight in database: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return null;
    }

    /**
     * Get all flights from database
     * @return List of all flights
     */
    public List<Flight> getAll() {
        String sql = "SELECT * FROM flight;";
        List<Flight> flights = new ArrayList<>();
        try (Connection conn = DriverManager.getConnection(url, username, password);
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                String flight_id = rs.getString("flight_id");
                String terminalName = rs.getString("terminal_name");
                LocalDateTime arrival = rs.getTimestamp("arrival").toLocalDateTime();
                LocalDateTime departure = rs.getTimestamp("departure").toLocalDateTime();
                String status = rs.getString("status");
                flights.add(new Flight(flight_id, terminalName, arrival, departure, status));
            }
        } catch (SQLException e) {
            System.out.println("Error getting all flights from database: " + e.getMessage());
            throw new RuntimeException(e);
        }
        return flights;
    }
}
