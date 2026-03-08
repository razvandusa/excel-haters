package app.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai")
public class AiProperties {
    private String baseUrl;
    private String analyzePath;
    private String flightServiceUrl;
    private String flightPath;

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getAnalyzePath() { return analyzePath; }
    public void setAnalyzePath(String analyzePath) { this.analyzePath = analyzePath; }

    public String getFlightServiceUrl() { return flightServiceUrl; }
    public void setFlightServiceUrl(String flightServiceUrl) { this.flightServiceUrl = flightServiceUrl; }

    public String getFlightPath() { return flightPath; }
    public void setFlightPath(String flightPath) { this.flightPath = flightPath; }
}