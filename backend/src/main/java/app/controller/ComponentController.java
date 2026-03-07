package app.controller;

import app.dto.component.CreateComponentRequest;
import app.dto.component.UpdateComponentRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ComponentController {

    @GetMapping("/api/terminals/{terminalId}/components")
    public List<Map<String, Object>> getComponentsByTerminal(@PathVariable Long terminalId) {
        return List.of(
                Map.of("id", 10, "name", "Gate A1", "type", "GATE", "terminalId", terminalId, "isActive", true),
                Map.of("id", 11, "name", "Desk A2", "type", "DESK", "terminalId", terminalId, "isActive", true)
        );
    }

    @PostMapping("/api/terminals/{terminalId}/components")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createComponent(
            @PathVariable Long terminalId,
            @RequestBody CreateComponentRequest request
    ) {
        return Map.of(
                "message", "Component created",
                "terminalId", terminalId,
                "name", request.getName(),
                "type", request.getType(),
                "isActive", request.getIsActive()
        );
    }

    @PatchMapping("/api/components/{id}")
    public Map<String, Object> updateComponent(
            @PathVariable Long id,
            @RequestBody UpdateComponentRequest request
    ) {
        return Map.of(
                "message", "Component updated",
                "id", id,
                "name", request.getName(),
                "isActive", request.getIsActive()
        );
    }

    @DeleteMapping("/api/components/{id}")
    public Map<String, Object> deleteComponent(@PathVariable Long id) {
        return Map.of(
                "message", "Component deleted",
                "id", id
        );
    }

    @GetMapping("/api/components/available")
    public List<Map<String, Object>> getAvailableComponents(
            @RequestParam String type,
            @RequestParam String startTime,
            @RequestParam String endTime
    ) {
        // assignmentService.findBy...
        return List.of(
                Map.of("id", 21, "name", "Gate B3", "type", type, "isActive", true),
                Map.of("id", 22, "name", "Gate B4", "type", type, "isActive", true)
        );
    }
}