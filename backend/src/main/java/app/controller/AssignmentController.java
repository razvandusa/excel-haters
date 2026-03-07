package app.controller;

import app.dto.assignment.UpdateAssignmentRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class AssignmentController {
    // assignmentService
    @GetMapping("/api/components/{componentId}/assignments")
    public List<Map<String, Object>> getAssignmentsForComponentByDate(
            @PathVariable Long componentId,
            @RequestParam String date
    ) {
        return List.of(
                Map.of(
                        "componentId", componentId,
                        "flightId", 1001,
                        "from", date + "T10:00:00",
                        "to", date + "T11:00:00"
                )
        );
    }

    @GetMapping("/api/flights/{flightId}/assignments")
    public List<Map<String, Object>> getAssignmentsForFlight(@PathVariable Long flightId) {
        return List.of(
                Map.of("assignmentId", 1, "flightId", flightId, "componentId", 10, "from", "2026-03-07T10:00:00", "to", "2026-03-07T11:00:00"),
                Map.of("assignmentId", 2, "flightId", flightId, "componentId", 11, "from", "2026-03-07T09:00:00", "to", "2026-03-07T09:30:00")
        );
    }

    @PatchMapping("/api/flights/{flightId}/assignments/{assignmentId}")
    public Map<String, Object> updateAssignment(
            @PathVariable Long flightId,
            @PathVariable Long assignmentId,
            @RequestBody UpdateAssignmentRequest request
    ) {
        return Map.of(
                "message", "Assignment updated",
                "flightId", flightId,
                "assignmentId", assignmentId,
                "componentId", request.getComponentId(),
                "from", request.getFrom(),
                "to", request.getTo()
        );
    }
}