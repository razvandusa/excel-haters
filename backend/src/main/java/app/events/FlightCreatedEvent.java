package app.events;

import org.springframework.context.ApplicationEvent;

public class FlightCreatedEvent extends ApplicationEvent {
    private final String flightId;
    private final String deskName;
    private final String securityName;
    private final String gateName;
    private final String standName;

    public FlightCreatedEvent(Object source, String flightId, String deskName, String securityName, String gateName, String standName) {
        super(source);
        this.flightId = flightId;
        this.deskName = deskName;
        this.securityName = securityName;
        this.gateName = gateName;
        this.standName = standName;
        System.out.println("FlightCreatedEvent fired: flightId=" + flightId + ", desk=" + deskName + ", security=" + securityName + ", gate=" + gateName + ", stand=" + standName);
    }

    public String getFlightId() {
        return flightId;
    }

    public String getDeskName() {
        return deskName;
    }

    public String getSecurityName() {
        return securityName;
    }

    public String getGateName() {
        return gateName;
    }

    public String getStandName() {
        return standName;
    }
}