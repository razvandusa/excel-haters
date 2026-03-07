package app.controller;

import app.dto.terminal.CreateTerminalRequest;
import app.dto.terminal.UpdateTerminalRequest;
import app.service.TerminalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/terminals")
public class TerminalController {

    private final TerminalService terminalService;

    @Autowired
    public TerminalController(TerminalService terminalService) {
        this.terminalService = terminalService;
    }

    @GetMapping
    public List<Map<String, Object>> getAllTerminals() {
//        List<Terminal> terminals = terminalService.getAll();
//        return terminals.stream()
//                .map(terminal -> Map.of(
//                        "id", terminal.getId(),
//                        "name", terminal.getName(),
//                        "type", terminal.getType(),
//                        "isActive", terminal.isActive()
//                ))
//                .toList();
        return List.of(
                Map.of("id", 1, "name", "Terminal A", "type", "ARRIVALS", "isActive", true),
                Map.of("id", 2, "name", "Terminal B", "type", "DEPARTURES", "isActive", true),
                Map.of("id", 3, "name", "Terminal C", "type", "DEPARTURES", "isActive", true)
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createTerminal(@RequestBody CreateTerminalRequest request) {
        try {
            terminalService.add(request);
            return Map.of(
                    "message", "Terminal created",
                    "name", request.getName(),
                    "type", request.getType(),
                    "isActive", request.getIsActive()
            );
        } catch (IllegalArgumentException e) {
            return Map.of(
                    "error", e.getMessage()
            );
        }
    }

    @PatchMapping("/{id}")
    public Map<String, Object> updateTerminal(
            @PathVariable Long id,
            @RequestBody UpdateTerminalRequest request
    ) {
        try {
            terminalService.update(id, request);
            return Map.of(
                    "message", "Terminal updated",
                    "id", id,
                    "name", request.getName(),
                    "isActive", request.getIsActive()
            );
        } catch (Exception e) {
            return Map.of(
                    "error", e.getMessage()
            );
        }
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteTerminal(@PathVariable Long id) {
        try {
            terminalService.remove(id);
            return Map.of(
                    "message", "Terminal deleted",
                    "id", id
            );
        } catch (Exception e) {
            return Map.of(
                    "error", e.getMessage()
            );
        }
    }
}