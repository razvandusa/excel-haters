package app.controller;

import app.dto.ai.CommitTerminalLayoutRequest;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/terminal-layouts")
public class AiController {

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> uploadLayoutImage(@RequestParam("file") MultipartFile file) {
        return Map.of(
                "jobId", "job-123",
                "status", "PROCESSING",
                "fileName", file.getOriginalFilename()
        );
    }

    @GetMapping("/{jobId}")
    public Map<String, Object> getLayoutAnalysis(@PathVariable String jobId) {
        return Map.of(
                "jobId", jobId,
                "status", "DONE",
                "detectedComponents", List.of(
                        Map.of("name", "Gate X1", "type", "GATE"),
                        Map.of("name", "Desk X2", "type", "DESK")
                )
        );
    }

    @PostMapping("/{jobId}/commit")
    public Map<String, Object> commitLayout(
            @PathVariable String jobId,
            @RequestBody CommitTerminalLayoutRequest request
    ) {
        return Map.of(
                "message", "AI layout committed",
                "jobId", jobId,
                "terminalId", request.getTerminalId()
        );
    }
}