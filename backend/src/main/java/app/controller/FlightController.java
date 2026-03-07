package app.controller;

import app.dto.flight.CreateFlightRequest;
import app.dto.flight.UpdateFlightRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/flights")
public class FlightController {

    @GetMapping("/{id}")
    public Map<String, Object> getFlightById(@PathVariable Long id) {
        return Map.of(
                "id", id,
                "code", "RO123",
                "departureTime", "2026-03-07T10:00:00",
                "status", "SCHEDULED"
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createFlight(@RequestBody CreateFlightRequest request) {
        return Map.of(
                "message", "Flight created",
                "flightCode", request.getFlightCode(),
                "terminalId", request.getTerminalId(),
                "departureTime", request.getDepartureTime()
        );
    }

    @PatchMapping("/{id}")
    public Map<String, Object> updateFlight(
            @PathVariable Long id,
            @RequestBody UpdateFlightRequest request
    ) {
        return Map.of(
                "message", "Flight updated",
                "id", id,
                "departureTime", request.getDepartureTime(),
                "arrivalTime", request.getArrivalTime(),
                "status", request.getStatus()
        );
    }
}