package app.controller;

import app.dto.ai.CommitFlightRequest;
import app.service.AiFlightService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/flights")
public class AiFlightController {

    private final AiFlightService aiFlightService;

    public AiFlightController(AiFlightService aiFlightService) {
        this.aiFlightService = aiFlightService;
    }

    // Upload a flight document → AI extracts flights → returns jobId + detected flights
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> uploadFlightDocument(@RequestParam("file") MultipartFile file) {
        return aiFlightService.uploadFlightDocument(file);
    }

    // Get the result of a previous flight extraction by jobId
    @GetMapping("/{jobId}")
    public Map<String, Object> getFlightAnalysis(@PathVariable String jobId) {
        return aiFlightService.getFlightAnalysis(jobId);
    }

    // Confirm and persist the detected flights
    @PostMapping("/{jobId}/commit")
    public Map<String, Object> commitFlights(
            @PathVariable String jobId,
            @RequestBody CommitFlightRequest request
    ) {
        return aiFlightService.commitFlights(jobId, request);
    }
}