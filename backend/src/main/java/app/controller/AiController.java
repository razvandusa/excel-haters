package app.controller;

import app.dto.ai.CommitTerminalLayoutRequest;
import app.service.AiLayoutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/terminal-layouts")
public class AiController {

    private final AiLayoutService aiLayoutService;

    public AiController(AiLayoutService aiLayoutService) {
        this.aiLayoutService = aiLayoutService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> uploadLayoutImage(@RequestParam("file") MultipartFile file) {
        return aiLayoutService.uploadLayoutImage(file);
    }

    @GetMapping("/{jobId}")
    public Map<String, Object> getLayoutAnalysis(@PathVariable String jobId) {
        return aiLayoutService.getLayoutAnalysis(jobId);
    }

    @PostMapping("/{jobId}/commit")
    public Map<String, Object> commitLayout(
            @PathVariable String jobId,
            @RequestBody CommitTerminalLayoutRequest request
    ) {
        return aiLayoutService.commitLayout(jobId, request);
    }
}