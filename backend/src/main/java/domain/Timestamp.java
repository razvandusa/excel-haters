package domain;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Timestamp {
    LocalDateTime start;
    LocalDateTime end;
    Long idComponent;

    public Timestamp(LocalDateTime start, LocalDateTime end, Long idComponent) {
        this.start = start;
        this.end = end;
        this.idComponent = idComponent;
    }

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
}
