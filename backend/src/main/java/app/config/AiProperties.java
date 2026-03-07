package app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai")
public class AiProperties {
    private String baseUrl;
    private String analyzePath;

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getAnalyzePath() { return analyzePath; }
    public void setAnalyzePath(String analyzePath) { this.analyzePath = analyzePath; }
}