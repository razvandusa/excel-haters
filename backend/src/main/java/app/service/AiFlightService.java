package app.service;

import app.dto.ai.CommitFlightRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiFlightService {

    private final AiPipelineClient aiPipelineClient;
    private final Map<String, Map<String, Object>> jobs = new ConcurrentHashMap<>();

    public AiFlightService(AiPipelineClient aiPipelineClient) {
        this.aiPipelineClient = aiPipelineClient;
    }

    public Map<String, Object> uploadFlightDocument(MultipartFile file) {
        String jobId = UUID.randomUUID().toString();

        Map<String, Object> result = aiPipelineClient.analyzeFlightDocument(file);

        Map<String, Object> jobData = new ConcurrentHashMap<>();
        jobData.put("jobId", jobId);
        jobData.put("status", result.get("status"));
        jobData.put("fileName", file.getOriginalFilename());
        jobData.put("detectedFlights", result.get("detectedFlights"));

        jobs.put(jobId, jobData);
        return jobData;
    }

    public Map<String, Object> getFlightAnalysis(String jobId) {
        return jobs.getOrDefault(jobId, Map.of(
                "jobId", jobId,
                "status", "NOT_FOUND"
        ));
    }

    public Map<String, Object> commitFlights(String jobId, CommitFlightRequest request) {
        Map<String, Object> job = jobs.get(jobId);
        if (job == null) {
            return Map.of("message", "Job not found", "jobId", jobId);
        }

        // later: call flight service to actually persist flights
        return Map.of(
                "message", "AI flights committed",
                "jobId", jobId,
                "detectedFlights", job.get("detectedFlights")
        );
    }
}