package app.service;

import app.dto.ai.CommitTerminalLayoutRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiLayoutService {

    private final AiPipelineClient aiPipelineClient;
    private final Map<String, Map<String, Object>> jobs = new ConcurrentHashMap<>();

    public AiLayoutService(AiPipelineClient aiPipelineClient) {
        this.aiPipelineClient = aiPipelineClient;
    }

    public Map<String, Object> uploadLayoutImage(MultipartFile file) {
        String jobId = UUID.randomUUID().toString();

        Map<String, Object> result = aiPipelineClient.analyzeLayout(file);

        Map<String, Object> jobData = new ConcurrentHashMap<>();
        jobData.put("jobId", jobId);
        jobData.put("status", "ready");
        jobData.put("fileName", file.getOriginalFilename());
        jobData.put("detectedComponents", result.get("detectedComponents"));

        jobs.put(jobId, jobData);
        return jobData;
    }

    public Map<String, Object> getLayoutAnalysis(String jobId) {
        return jobs.getOrDefault(jobId, Map.of(
                "jobId", jobId,
                "status", "NOT_FOUND"
        ));
    }

    public Map<String, Object> commitLayout(String jobId, CommitTerminalLayoutRequest request) {
        Map<String, Object> job = jobs.get(jobId);
        if (job == null) {
            return Map.of("message", "Job not found", "jobId", jobId);
        }

        // later: call terminal/component service to actually persist components
        return Map.of(
                "message", "AI layout committed",
                "jobId", jobId,
                "terminalId", request.getTerminalId(),
                "detectedComponents", job.get("detectedComponents")
        );
    }
}