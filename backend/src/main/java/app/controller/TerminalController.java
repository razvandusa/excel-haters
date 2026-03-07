package app.controller;

import app.dto.terminal.CreateTerminalRequest;
import app.dto.terminal.UpdateTerminalRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/terminals")
public class TerminalController {

    @GetMapping
    public List<Map<String, Object>> getAllTerminals() {
        return List.of(
                Map.of("id", 1, "name", "Terminal A", "type", "ARRIVALS", "isActive", true),
                Map.of("id", 2, "name", "Terminal B", "type", "DEPARTURES", "isActive", true),
                Map.of("id", 3, "name", "Terminal C", "type", "DEPARTURES", "isActive", true)
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createTerminal(@RequestBody CreateTerminalRequest request) {
        return Map.of(
                "message", "Terminal created",
                "name", request.getName(),
                "type", request.getType(),
                "isActive", request.getIsActive()
        );
    }

    @PatchMapping("/{id}")
    public Map<String, Object> updateTerminal(
            @PathVariable Long id,
            @RequestBody UpdateTerminalRequest request
    ) {
        return Map.of(
                "message", "Terminal updated",
                "id", id,
                "name", request.getName(),
                "isActive", request.getIsActive()
        );
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteTerminal(@PathVariable Long id) {
        return Map.of(
                "message", "Terminal deleted",
                "id", id
        );
    }
}