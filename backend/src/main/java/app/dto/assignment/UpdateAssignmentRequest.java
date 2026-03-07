package app.dto.assignment;

public class UpdateAssignmentRequest {
    private String flightId;
    private Long oldComponentId;
    private Long newComponentId;
    private String from;
    private String to;

    public String getFlightId() {
        return flightId;
    }

    public void setFlightId(String flightId) {
        this.flightId = flightId;
    }

    public Long getOldComponentId() {
        return oldComponentId;
    }

    public void setOldComponentId(Long oldComponentId) {
        this.oldComponentId = oldComponentId;
    }

    public Long getNewComponentId() {
        return newComponentId;
    }

    public void setNewComponentId(Long newComponentId) {
        this.newComponentId = newComponentId;
    }

    public String getFrom() {
        return from;
    }

    public void setFrom(String from) {
        this.from = from;
    }

    public String getTo() {
        return to;
    }

    public void setTo(String to) {
        this.to = to;
    }
}
