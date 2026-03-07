package app.controller;

import app.domain.Flight;
import app.dto.flight.CreateFlightRequest;
import app.dto.flight.UpdateFlightRequest;
import app.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/flights")
public class FlightController {

    private final FlightService flightService;

    @Autowired
    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getFlightById(@PathVariable String id) {
        try {
            Flight flight = flightService.findById(id);
            if (flight == null) {
                return Map.of("error", "Flight not found");
            }
            return Map.of(
                    "flightId", flight.getFlightId(),
                    "terminalName", flight.getTerminalName(),
                    "arrivalTime", flight.getArrival(),
                    "departureTime", flight.getDeparture(),
                    "status", flight.getStatus()
            );
        } catch (Exception e) {
            return Map.of(
                    "error", e.getMessage()
            );
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createFlight(@RequestBody CreateFlightRequest request) {
        try {
            flightService.add(request);
            return Map.of(
                    "message", "Flight created",
                    "flightId", request.getFlightId(),
                    "terminalName", request.getTerminalName(),
                    "departureTime", request.getDepartureTime(),
                    "arrivalTime", request.getArrivalTime()
            );
        } catch (Exception e) {
            return Map.of(
                    "error", e.getMessage()
            );
        }
    }

    @PatchMapping("/{id}")
    public Map<String, Object> updateFlight(
            @PathVariable String id,
            @RequestBody UpdateFlightRequest request
    ) {
        try {
            flightService.delay(id, request);
            return Map.of(
                    "message", "Flight updated",
                    "id", id,
                    "departureTime", request.getDepartureTime(),
                    "arrivalTime", request.getArrivalTime()
            );
        } catch (Exception e) {
            return Map.of(
                    "error", e.getMessage()
            );
        }
    }
}