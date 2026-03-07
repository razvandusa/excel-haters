package app.domain;

import java.time.LocalDateTime;

public class Assignment {
    LocalDateTime start;
    LocalDateTime end;
    Long idComponent;
    String idFlight;

    public Assignment(LocalDateTime start, LocalDateTime end, Long idComponent, String idFlight) {
        this.start = start;
        this.end = end;
        this.idComponent = idComponent;
        this.idFlight = idFlight;
    }

    public Assignment() {}

    public LocalDateTime getStart() {
        return start;
    }
    public LocalDateTime getEnd() {
        return end;
    }
    public Long getIdComponent() {
        return idComponent;
    }

    public void setStart(LocalDateTime start) {
        this.start = start;
    }
    public void setEnd(LocalDateTime end) {
        this.end = end;
    }
    public void setIdComponent(Long idComponent) {
        this.idComponent = idComponent;
    }
    public String getIdFlight() {
        return idFlight;
    }
    public void setIdFlight(String idFlight) {
        this.idFlight = idFlight;
    }
}
