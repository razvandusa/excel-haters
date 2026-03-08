package app.service;

import app.domain.Flight;
import app.dto.flight.CreateFlightRequest;
import app.dto.flight.UpdateFlightRequest;
import app.events.FlightCreatedEvent;
import app.repository.FlightDBRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class FlightService {

    private final FlightDBRepository repository;
    private final TerminalService terminalService;
    private final ApplicationEventPublisher eventPublisher;
    private final ComponentService componentService;

    public FlightService(FlightDBRepository repository,
                         TerminalService terminalService,
                         ApplicationEventPublisher eventPublisher,
                         ComponentService componentService) {
        this.repository = repository;
        this.terminalService = terminalService;
        this.eventPublisher = eventPublisher;
        this.componentService = componentService;
    }

    public void add(CreateFlightRequest flightRequest) { // metoda trebuie sa declanseze algoritmul de distribuire a componentelor pentru flight
        Flight flight = new Flight();
        if (flightRequest.getFlightId() == null || flightRequest.getFlightId().isBlank()) {
            throw new IllegalArgumentException("Flight ID must not be null or blank");
        }
        if (findById(flightRequest.getFlightId()) != null) {
            throw new IllegalArgumentException("Flight with this flightId already exists.");
        }
        flight.setFlightId(flightRequest.getFlightId());
        if (flightRequest.getTerminalName() == null || !terminalService.findByName(flightRequest.getTerminalName()).getActive()) {
            throw new IllegalArgumentException("Terminal does not exist.");
        }
        flight.setTerminalName(flightRequest.getTerminalName());
        if (flightRequest.getDepartureTime() != null) {
            flight.setDeparture(LocalDateTime.parse(flightRequest.getDepartureTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        } else if (flightRequest.getArrivalTime() != null) {
            flight.setArrival(LocalDateTime.parse(flightRequest.getArrivalTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
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
            if (minutesToDeparture > 50) {
                flight.setStatus("SCHEDULED");
            } else if (minutesToDeparture > 0 && minutesToDeparture <= 50) {
                flight.setStatus("BOARDING");
            } else if (minutesToDeparture <= 0) {
                flight.setStatus("CLOSED");
            }
        } else if (hasArrival) {
            long minutesToArrival = java.time.Duration.between(now, flight.getArrival()).toMinutes();
            if (minutesToArrival >= 0) {
                flight.setStatus("SCHEDULED");
            } else if (minutesToArrival < 0 && minutesToArrival >= -15) {
                flight.setStatus("DEPLANING");
            } else {
                flight.setStatus("CLOSED");
            }
        }
        repository.save(flight);
        eventPublisher.publishEvent(new FlightCreatedEvent(this, flight.getFlightId(), flightRequest.getDeskName(), flightRequest.getSecurityName(), flightRequest.getGateName(), flightRequest.getStandName()));
    }

    public void remove(String id) {
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
                       String status) { // metoda folosita cand updatam un flight in algoritm

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
    public void delay(String id, UpdateFlightRequest updateFlightRequest) {
        Flight flight = repository.findById(id);

        if (flight == null) {
            throw new IllegalArgumentException("Flight with id " + id + " does not exist");
        }

        if ("CLOSED".equals(flight.getStatus())) {
            throw new IllegalArgumentException("Cannot delay an closed flight");
        }

        if (updateFlightRequest.getArrivalTime() != null) {
            flight.setDeparture((LocalDateTime.parse(updateFlightRequest.getArrivalTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
        } else if (updateFlightRequest.getDepartureTime() != null) {
            flight.setArrival((LocalDateTime.parse(updateFlightRequest.getDepartureTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME)));
        }
        flight.setStatus("DELAYED");

        repository.update(flight);
        eventPublisher.publishEvent(new FlightCreatedEvent(this, flight.getFlightId(), null, null, null, null));
    }

    public Flight findById(String id) {
        return repository.findById(id);
    }

    public List<Flight> getAll() {
        return repository.getAll();
    }
}