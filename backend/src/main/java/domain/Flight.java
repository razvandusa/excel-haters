package domain;

import java.time.LocalDateTime;

public class Flight {
    Long flightId;
    Component gate;
    Component desk;
    Component security;
    Component stand;
    String terminalName;
    LocalDateTime arrival;
    LocalDateTime departure;
    String status;

    public Flight(Long flightId, Component gate, Component desk, Component security, Component stand,
                  String terminalName, LocalDateTime arrival, LocalDateTime departure, String status) {
        this.flightId = flightId;
        this.gate = gate;
        this.desk = desk;
        this.security = security;
        this.stand = stand;
        this.terminalName = terminalName;
        this.arrival = arrival;
        this.departure = departure;
        this.status = status;
    }

    public Long getFlightId() {
        return flightId;
    }

    public void setFlightId(Long flightId) {
        this.flightId = flightId;
    }

    public Component getGate() {
        return gate;
    }

    public void setGate(Component gate) {
        this.gate = gate;
    }

    public Component getDesk() {
        return desk;
    }

    public void setDesk(Component desk) {
        this.desk = desk;
    }

    public Component getSecurity() {
        return security;
    }

    public void setSecurity(Component security) {
        this.security = security;
    }

    public Component getStand() {
        return stand;
    }

    public void setStand(Component stand) {
        this.stand = stand;
    }

    public String getTerminalName() {
        return terminalName;
    }

    public void setTerminalName(String terminalName) {
        this.terminalName = terminalName;
    }

    public LocalDateTime getArrival() {
        return arrival;
    }

    public void setArrival(LocalDateTime arrival) {
        this.arrival = arrival;
    }

    public LocalDateTime getDeparture() {
        return departure;
    }

    public void setDeparture(LocalDateTime departure) {
        this.departure = departure;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

}
