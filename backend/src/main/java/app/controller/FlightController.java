package app.controller;

import app.domain.Flight;
import app.dto.flight.CreateFlightRequest;
import app.dto.flight.UpdateFlightRequest;
import app.service.FlightService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
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
    public ResponseEntity<Map<String, Object>> createFlight(@RequestBody CreateFlightRequest request) {
        try {
            flightService.add(request);
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("message", "Flight created");
            body.put("flightId", request.getFlightId());
            body.put("terminalName", request.getTerminalName());
            body.put("departureTime", request.getDepartureTime());
            body.put("arrivalTime", request.getArrivalTime());
            return ResponseEntity.status(HttpStatus.CREATED).body(body);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Invalid flight request"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Unexpected server error while creating flight."
            ));
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateFlight(
            @PathVariable String id,
            @RequestBody UpdateFlightRequest request
    ) {
        try {
            flightService.delay(id, request);
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("message", "Flight updated");
            body.put("id", id);
            body.put("departureTime", request.getDepartureTime());
            body.put("arrivalTime", request.getArrivalTime());
            return ResponseEntity.ok(body);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage() != null ? e.getMessage() : "Invalid flight update request"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Unexpected server error while updating flight."
            ));
        }
    }
}
