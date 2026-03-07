package app.controller;

import app.domain.Component;
import app.dto.component.CreateComponentRequest;
import app.dto.component.UpdateComponentRequest;
import app.service.ComponentService;
import app.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class ComponentController {

    private final ComponentService componentService;
    private final AssignmentService assignmentService;

    @Autowired
    public ComponentController(ComponentService componentService, AssignmentService assignmentService) {
        this.componentService = componentService;
        this.assignmentService = assignmentService;
    }

    @GetMapping("/api/terminals/{terminalId}/components")
    public List<Map<String, Object>> getComponentsByTerminal(@PathVariable Long terminalId) {
        List<Component> components = componentService.getAllByTerminalId(terminalId);
        return components.stream()
                .<Map<String, Object>>map(component -> Map.of(
                        "id", component.getId(),
                        "name", component.getName(),
                        "type", component.getType(),
                        "terminalId", terminalId,
                        "isActive", component.getActive()
                ))
                .toList();
    }


    @PostMapping("/api/terminals/{terminalId}/components")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createComponent(
            @PathVariable Long terminalId,
            @RequestBody CreateComponentRequest request
    ) {
        try {
            componentService.add(terminalId, request);
            return Map.of(
                    "message", "Component created",
                    "terminalId", terminalId,
                    "name", request.getName(),
                    "type", request.getType(),
                    "isActive", request.getIsActive()
            );
        } catch (Exception e) {
            return Map.of(
                    "error", e.getMessage()
            );
        }
    }

    @PatchMapping("/api/components/{id}")
    public Map<String, Object> updateComponent(
            @PathVariable Long id,
            @RequestBody UpdateComponentRequest request
    ) {
        try {
            componentService.update(id, request);
            return Map.of(
                    "message", "Component updated",
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

    @DeleteMapping("/api/components/{id}")
    public Map<String, Object> deleteComponent(@PathVariable Long id) {
        try {
            componentService.remove(id);
            return Map.of(
                    "message", "Component deleted",
                    "id", id
            );
        } catch (Exception e) {
            return Map.of(
                    "error", e.getMessage()
            );
        }
    }

    @GetMapping("/api/components/available")
    public List<Map<String, Object>> getAvailableComponents(
            @RequestParam String type,
            @RequestParam String startTime,
            @RequestParam String endTime
    ) {
        List<Component> available = assignmentService.findByTypeAndInterval(type, startTime, endTime);
        return available.stream()
                .map(component -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id", component.getId());
                    map.put("name", component.getName());
                    map.put("type", component.getType());
                    map.put("isActive", component.getActive());
                    return map;
                })
                .toList();
    }
}