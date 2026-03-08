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

    private final WebClient ocrWebClient;
    private final WebClient flightWebClient;
    private final AiProperties aiProperties;

    public AiPipelineClient(AiProperties aiProperties) {
        this.aiProperties = aiProperties;
        // OCR service — handles airport layout images → components
        this.ocrWebClient = WebClient.builder()
                .baseUrl(aiProperties.getBaseUrl())
                .build();
        // Flight service — handles flight documents → flights
        this.flightWebClient = WebClient.builder()
                .baseUrl(aiProperties.getFlightServiceUrl())
                .build();
    }

    public Map<String, Object> analyzeLayout(MultipartFile file) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            }).contentType(MediaType.parseMediaType(file.getContentType()));

            // POST to Python OCR service → /components/import
            // Returns: { "components": [{"type": "DESK", "name": "1"}, ...] }
            Map response = ocrWebClient.post()
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

    public Map<String, Object> analyzeFlightDocument(MultipartFile file) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            }).contentType(MediaType.parseMediaType(file.getContentType()));

            // POST to Python flight service → /flights/import
            // Returns: { "flights": [{"flightId": "AA1", "gate": "G1", ...}, ...] }
            Map response = flightWebClient.post()
                    .uri(aiProperties.getFlightPath())
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            List<?> flights = (List<?>) response.get("flights");

            return Map.of(
                    "status", "DONE",
                    "detectedFlights", flights
            );

        } catch (Exception e) {
            return Map.of(
                    "status", "ERROR",
                    "detectedFlights", List.of(),
                    "error", e.getMessage()
            );
        }
    }
}