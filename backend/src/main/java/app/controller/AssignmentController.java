package app.controller;

import app.domain.Assignment;
import app.service.AssignmentService;
import app.dto.assignment.UpdateAssignmentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
public class AssignmentController {

    private final AssignmentService assignmentService;

    @Autowired
    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping("/api/components/{componentId}/assignments")
    public List<Map<String, Object>> getAssignmentsForComponentByDate(
            @PathVariable Long componentId,
            @RequestParam String date
    ) {
        try {
            LocalDate localDate = LocalDate.parse(date);
            List<Assignment> assignments= assignmentService.findByComponentIdAndDate(componentId, localDate);
            return assignments.stream()
                    .map(a -> Map.<String, Object>of(
                            "componentId", a.getIdComponent(),
                            "flightId", a.getIdFlight(),
                            "from", a.getStart(),
                            "to", a.getEnd()
                    ))
                    .toList();
        } catch (Exception e) {
            return List.of(Map.of("error", e.getMessage()));
        }
    }


    @GetMapping("/api/flights/{flightId}/assignments")
    public List<Map<String, Object>> getAssignmentsForFlight(@PathVariable Long flightId) {
        try {
            List<Assignment> assignments = assignmentService.findAssignmentsByFlightId(flightId);
            return assignments.stream()
                    .map(a -> Map.<String, Object>of(
                            "flightId", a.getIdFlight(),
                            "componentId", a.getIdComponent(),
                            "from", a.getStart(),
                            "to", a.getEnd()
                    ))
                    .toList();
        } catch (Exception e) {
            return List.of(Map.of("error", e.getMessage()));
        }

        return List.of(
                Map.of("assignmentId", 1, "flightId", flightId, "componentId", 10, "from", "2026-03-07T10:00:00", "to", "2026-03-07T11:00:00"),
                Map.of("assignmentId", 2, "flightId", flightId, "componentId", 11, "from", "2026-03-07T09:00:00", "to", "2026-03-07T09:30:00")
        );
    }

    @PatchMapping("/api/assignments")
    public Map<String, Object> updateAssignmentComponent(@RequestBody UpdateAssignmentComponentRequest request) {
        try {
            assignmentService.update(request);
            return Map.of(
                    "message", "Assignment component updated",
                    "flightId", request.getFlightId(),
                    "oldComponentId", request.getOldComponentId(),
                    "newComponentId", request.getNewComponentId()
            );
        } catch (Exception e) {
            return Map.of("error", e.getMessage());
        }
    }
}