package app.service;

import app.domain.Assignment;
import app.domain.Component;
import app.dto.assignment.UpdateAssignmentRequest;
import app.repository.AssignmentDBRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentDBRepository repository;
    private final FlightService flightService;
    private final ComponentService componentService;

    public AssignmentService(AssignmentDBRepository repository, FlightService flightService, ComponentService componentService) {
        this.repository = repository;
        this.flightService = flightService;
        this.componentService = componentService;
    }

    public void add(Assignment assignment) {
        // Verificare ca componenta sa existe si sa fie activa
        var component = componentService.findById(assignment.getIdComponent());
        if (component == null || !component.getActive()) {
            throw new IllegalArgumentException("Component is invalid");
        }

        // Verificare ca flight-ul sa existe
        var flight = flightService.findById(assignment.getIdFlight());
        if (flight == null) {
            throw new IllegalArgumentException("Flight is invalid");
        }

        // Setarea intervalului logic în funcție de tipul componentei
        LocalDateTime start;
        LocalDateTime finish;

        switch (component.getType()) {
            case "DESK":
                if (flightService.findById(assignment.getIdFlight()).getDeparture() != null) {
                    start = flight.getDeparture().minusHours(4);
                    finish = flight.getDeparture().minusHours(2);
                } else {
                    start = flight.getArrival().minusMinutes(30);
                    finish = flight.getArrival().plusMinutes(120);
                }
                break;
            case "SECURITY":
                if (flightService.findById(assignment.getIdFlight()).getDeparture() != null) {
                    start = flight.getDeparture().minusHours(3);
                    finish = flight.getDeparture().minusHours(2);
                } else {
                    start = flight.getArrival().plusMinutes(15);
                    finish = flight.getArrival().plusMinutes(90);
                }
                break;
            case "GATE":
                if (flightService.findById(assignment.getIdFlight()).getDeparture() != null) {
                    start = flight.getDeparture().minusHours(2);
                    finish = flight.getDeparture().minusMinutes(15);
                } else {
                    start = flight.getArrival();
                    finish = flight.getArrival().plusHours(1);
                }
                break;
            case "STAND":
                if (flightService.findById(assignment.getIdFlight()).getDeparture() != null) {
                    start = flight.getDeparture().minusHours(1);
                    finish = flight.getDeparture().plusMinutes(15);
                } else {
                    start = flight.getArrival().minusHours(1);
                    finish = flight.getArrival().plusMinutes(15);
                }
                break;
            default:
                start = flight.getDeparture();
                finish = flight.getArrival();
        }

        assignment.setStart(start);
        assignment.setEnd(finish);

        repository.save(assignment);
    }

    public void update(UpdateAssignmentRequest updateAssignmentRequest) {
        Assignment assignment = new Assignment();
        assignment.setIdFlight(updateAssignmentRequest.getFlightId());
        assignment.setIdComponent(updateAssignmentRequest.getOldComponentId());
        assignment.setStart(LocalDateTime.parse(updateAssignmentRequest.getFrom(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        assignment.setEnd(LocalDateTime.parse(updateAssignmentRequest.getTo(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        Long newComponentId = updateAssignmentRequest.getNewComponentId();

        Assignment existingAssignment = repository.findById(assignment);
        if (existingAssignment == null) {
            throw new IllegalArgumentException("Assignment does not exist.");
        }

        var component = componentService.findById(assignment.getIdComponent());
        if (component == null || !component.getActive()) {
            throw new IllegalArgumentException("Component ID is invalid");
        }

        var flight = flightService.findById(assignment.getIdFlight());
        if (flight == null) {
            throw new IllegalArgumentException("Flight ID is invalid");
        }

        Assignment updatedAssignment = new Assignment();
        updatedAssignment.setIdFlight(assignment.getIdFlight());
        updatedAssignment.setIdComponent(newComponentId);
        updatedAssignment.setStart(assignment.getStart());
        updatedAssignment.setEnd(assignment.getEnd());

        repository.update(assignment, updatedAssignment);
    }

    public void remove(Assignment id) {
        // Verificare daca exista un assignment cu acest id
        Assignment assignment = repository.findById(id);
        if (assignment == null) {
            throw new IllegalArgumentException("Assignment with id " + id + " does not exist.");
        }
        repository.delete(assignment);
    }

    public Assignment findById(Assignment id) {
        return repository.findById(id);
    }

    public List<Assignment> findByComponentId(Long idComponent) {
        // Toate assignments pentru un anumit component
        return repository.getAll().stream()
                .filter(t -> t.getIdComponent().equals(idComponent))
                .toList();
    }

    public List<Assignment> findByFlightId(String idFlight) {
        // Toate assignments pentru un anumit flight
        return repository.getAll().stream()
                .filter(t -> t.getIdFlight().equals(idFlight))
                .toList();
    }

    public List<Assignment> getAll() {
        return repository.getAll();
    }

    public List<Component> findByTypeAndInterval(String type, String intervalStartStr, String intervalEndStr) {
        if (type == null || intervalStartStr == null || intervalEndStr == null) {
            throw new IllegalArgumentException("Type și intervalul nu pot fi null");
        }

        // conversie string -> LocalDateTime
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime intervalStart = LocalDateTime.parse(intervalStartStr, formatter);
        LocalDateTime intervalEnd = LocalDateTime.parse(intervalEndStr, formatter);

        // toate componentele de tipul dorit
        return componentService.getAll().stream()
                .filter(c -> type.equals(c.getType()))
                .filter(c -> isComponentFreeInInterval(c, intervalStart, intervalEnd))
                .toList();
    }

    private boolean isComponentFreeInInterval(Component component, LocalDateTime start, LocalDateTime end) {
        List<Assignment> assignments = repository.getAll().stream()
                .filter(a -> a.getIdComponent().equals(component.getId()))
                .toList();

        // componenta e liberă dacă niciun assignment nu se suprapune cu intervalul
        return assignments.stream()
                .noneMatch(a -> !(end.isBefore(a.getStart()) || start.isAfter(a.getEnd())));
    }

    public List<Assignment> findByComponentIdAndDate(Long idComponent, LocalDate date) {
        if (idComponent == null || date == null) {
            throw new IllegalArgumentException("idComponent și data nu pot fi null");
        }
        return repository.getAll().stream()
                .filter(a -> a.getIdComponent().equals(idComponent))
                .filter(a -> {
                    if (a.getStart() == null || a.getEnd() == null) {
                        return false;
                    }
                    LocalDate startDate = a.getStart().toLocalDate();
                    LocalDate endDate = a.getEnd().toLocalDate();
                    return (!startDate.isAfter(date) && !endDate.isBefore(date));
                })
                .toList();
    }

    public List<Assignment> findAssignmentsByFlightId(String flightId) {
        if (flightId == null) {
            throw new IllegalArgumentException("flightId nu poate fi null");
        }
        return repository.getAll().stream()
                .filter(a -> a.getIdFlight().equals(flightId))
                .toList();
    }

}