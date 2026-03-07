package app.service;

import app.config.AiProperties;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

@Component
public class AiPipelineClient {

    private final WebClient webClient;
    private final AiProperties aiProperties;

    public AiPipelineClient(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
        this.webClient = WebClient.builder()
                .baseUrl(aiProperties.getBaseUrl())
                .build();
    }

    public Map<String, Object> analyzeLayout(MultipartFile file) {
        try {
            // Build multipart body to forward the image to the Python OCR service
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            }).contentType(MediaType.parseMediaType(file.getContentType()));

            // POST to Python OCR → /components/import
            // Python returns: { "components": [{"type": "DESK", "name": "1"}, ...] }
            Map response = webClient.post()
                    .uri(aiProperties.getAnalyzePath())
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<?> components = (List<?>) response.get("components");

            return Map.of(
                    "status", "DONE",
                    "detectedComponents", components
            );

        } catch (Exception e) {
            return Map.of(
                    "status", "ERROR",
                    "detectedComponents", List.of(),
                    "error", e.getMessage()
            );
        }
    }
}
```

The full flow now works like this:
```
Frontend
    ↓
POST /api/ai/terminal-layouts  (multipart image)
    ↓ AiController → AiLayoutService → AiPipelineClient
    ↓
POST http://localhost:8001/components/import  (Python OCR)
    ↓
{ "components": [{"type":"GATE","name":"1"}, ...] }
    ↓ back to Java, stored in jobs map with jobId
    ↓
returns { jobId, status, detectedComponents }

Frontend reviews the result
    ↓
POST /api/ai/terminal-layouts/{jobId}/commit
    ↓ AiLayoutService.commitLayout() → persists components