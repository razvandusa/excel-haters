package app.service;

import app.domain.Flight;

import java.time.LocalDateTime;
import java.util.List;

public class FlightService {

    private final FlightDBRepository repository;
    private final TerminalService terminalService;

    public FlightService(FlightDBRepository repository,
                         TerminalService terminalService) {
        this.repository = repository;
        this.terminalService = terminalService;
    }

    public void add(Flight flight) {
        // Verificare daca exista deja un flight cu acest flightId.
        if (findById(flight.getFlightId()) != null) {
            throw new IllegalArgumentException("Flight with this flightId already exists.");
        }

        // Verificare daca exista terminalul cu numele si este activ terminalul
        if (flight.getTerminalName() == null || !terminalService.findByName(flight.getTerminalName()).getActive()) {
            throw new IllegalArgumentException("Terminal does not exist.");
        }

        // Verificare daca flight-ul este doar de tip arrival sau departure
        boolean hasArrival = flight.getArrival() != null;
        boolean hasDeparture = flight.getDeparture() != null;
        if (hasArrival == hasDeparture) { // ambele true sau ambele false
            throw new IllegalArgumentException("Define either arrival or departure, not both.");
        }

        // Setare statusul flight-ului in functie de data curenta
        LocalDateTime now = LocalDateTime.now();
        if (hasDeparture) {
            long minutesToDeparture = java.time.Duration.between(now, flight.getDeparture()).toMinutes();
            if (minutesToDeparture > 24 * 60) {
                flight.setStatus("SCHEDULED");
            } else if (minutesToDeparture > 50) {
                flight.setStatus("SCHEDULED");
            } else if (minutesToDeparture > 15) {
                flight.setStatus("BOARDING");
            } else if (minutesToDeparture >= 0) {
                flight.setStatus("CLOSED");
            } else {
                flight.setStatus("INACTIVE");
            }
        } else if (hasArrival) {
            long minutesToArrival = java.time.Duration.between(now, flight.getArrival()).toMinutes();
            if (minutesToArrival > 15) {
                flight.setStatus("SCHEDULED");
            } else if (minutesToArrival >= 0) {
                flight.setStatus("DEPLANING");
            } else {
                flight.setStatus("INACTIVE");
            }
        }
        repository.save(flight);
    }

    public void remove(Long id) {
        // Verificare ca flight-ul sa existe
        Flight flight = repository.findById(id);
        if (flight == null) {
            throw new IllegalArgumentException("Flight with id " + id + " does not exist");
        }
        repository.deleteById(id);
    }

    // Update complet al unui flight
    public void update(String id,
                       String terminalName,
                       LocalDateTime arrival,
                       LocalDateTime departure,
                       String status) {

        // Verificare daca exista flight-ul cu id-ul dat
        Flight flight = repository.findById(id);

        // Verificare ca flight sa nu fie null
        if (flight != null) {
            // Setam campurile care nu sunt null
            if (terminalName != null && !terminalName.isBlank()) {
                flight.setTerminalName(terminalName);
            }

            if (arrival != null) {
                flight.setArrival(arrival);
            }

            if (departure != null) {
                flight.setDeparture(departure);
            }

            if (status != null && !status.isBlank()) {
                flight.setStatus(status);
            }

            repository.update(flight);
        }
    }

    // Seteaza delay pentru un flight
    public void delay(Long id, LocalDateTime newDepartureTime) {
        Flight flight = repository.findById(id);

        if (flight == null) {
            throw new IllegalArgumentException("Flight with id " + id + " does not exist");
        }

        if ("INACTIVE".equals(flight.getStatus())) {
            throw new IllegalArgumentException("Cannot delay an inactive flight");
        }

        flight.setDeparture(newDepartureTime);
        flight.setStatus("DELAYED");

        repository.update(flight);
    }

    public Flight findById(String id) {
        return repository.findById(id);
    }

    public List<Flight> getAll() {
        return repository.getAll();
    }
}