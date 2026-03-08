package app.dto.ai;

// Request body for confirming and persisting AI-detected flights
// Can be extended later with additional fields if needed (e.g. terminalId, overwrite flag)
public class CommitFlightRequest {

    private Long terminalId;

    public Long getTerminalId() { return terminalId; }
    public void setTerminalId(Long terminalId) { this.terminalId = terminalId; }
}