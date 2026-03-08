package app.events;

import app.service.AssignmentService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class FlightAssignmentListener {

    private final AssignmentService assignmentService;

    public FlightAssignmentListener(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @EventListener
    public void handleFlightCreated(FlightCreatedEvent event) {
        System.out.println("Flight created event received: " + event.getFlightId());

        assignmentService.scheduleAssignmentForFlight(
                event.getFlightId(),
                event.getDeskName(),
                event.getSecurityName(),
                event.getGateName(),
                event.getStandName()
        );
    }
}