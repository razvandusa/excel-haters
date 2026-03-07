package app.service;

import app.config.AiProperties;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Component
public class AiPipelineClient {

    private final AiProperties aiProperties;

    public AiPipelineClient(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
    }

    public Map<String, Object> analyzeLayout(MultipartFile file) {
        // for now stub it
        return Map.of(
                "status", "DONE",
                "detectedComponents", List.of(
                        Map.of("name", "Gate X1", "type", "GATE"),
                        Map.of("name", "Desk X2", "type", "DESK")
                )
        );
    }
}