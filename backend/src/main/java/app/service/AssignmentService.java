package app.service;

import app.domain.Assignment;
import app.domain.Component;
import app.dto.assignment.UpdateAssignmentRequest;
import app.repository.AssignmentDBRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
            throw new IllegalArgumentException("Component ID is invalid");
        }

        // Verificare ca flight-ul sa existe
        var flight = flightService.findById(assignment.getIdFlight());
        if (flight == null) {
            throw new IllegalArgumentException("Flight ID is invalid");
        }

        // Setarea intervalului logic în funcție de tipul componentei
        LocalDateTime start;
        LocalDateTime finish;

        switch (component.getType()) {
            case "DESK":
                start = flight.getDeparture().minusHours(4);
                finish = flight.getDeparture().minusHours(3);
                break;
            case "SECURITY":
                start = flight.getDeparture().minusHours(3);
                finish = flight.getDeparture().minusHours(2);
                break;
            case "GATE":
                start = flight.getDeparture().minusHours(1);
                finish = flight.getDeparture().plusHours(1);
                break;
            case "STAND":
                start = flight.getDeparture();
                finish = flight.getArrival();
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
        repository.deleteById();
        if (assignment == null) {
            throw new IllegalArgumentException("Assignment assignment nu poate fi null");
        }

        Assignment existingAssignment = repository.findById(assignment.getId());
        if (existingAssignment == null) {
            throw new IllegalArgumentException("Assignment with id " + assignment.getId() + " does not exist.");
        }

        var component = componentService.findById(assignment.getIdComponent());
        if (component == null || !component.getActive()) {
            throw new IllegalArgumentException("Component ID is invalid");
        }

        var flight = flightService.findById(assignment.getIdFlight());
        if (flight == null) {
            throw new IllegalArgumentException("Flight ID is invalid");
        }

        LocalDateTime start;
        LocalDateTime finish;

        switch (component.getType()) {
            case "DESK":
                start = flight.getDeparture().minusHours(4);
                finish = flight.getDeparture().minusHours(3);
                break;
            case "SECURITY":
                start = flight.getDeparture().minusHours(3);
                finish = flight.getDeparture().minusHours(2);
                break;
            case "GATE":
                start = flight.getDeparture().minusHours(1);
                finish = flight.getDeparture().plusHours(1);
                break;
            case "STAND":
                start = flight.getDeparture();
                finish = flight.getArrival();
                break;
            default:
                start = flight.getDeparture();
                finish = flight.getArrival();
        }

        assignment.setStart(start);
        assignment.setEnd(finish);

        List<Assignment> assignmentsForComponent = repository.getAll().stream()
                .filter(a -> a.getIdComponent().equals(assignment.getIdComponent()))
                .filter(a -> !a.getId().equals(assignment.getId()))
                .toList();

        for (Assignment a : assignmentsForComponent) {
            if (a.getStart() != null && a.getEnd() != null && assignment.getStart() != null && assignment.getEnd() != null) {
                boolean overlap = !(assignment.getEnd().isBefore(a.getStart()) || assignment.getStart().isAfter(a.getEnd()));
                if (overlap) {
                    throw new IllegalArgumentException("Assignment interval overlaps with another assignment for the same component.");
                }
            }
        }

        repository.update(assignment);
    }

    public void remove(Long id) {
        // Verificare daca exista un assignment cu acest id
        Assignment assignment = repository.findById(id);
        if (assignment == null) {
            throw new IllegalArgumentException("Assignment with id " + id + " does not exist.");
        }
        repository.deleteById(id);
    }

    public Assignment findById(Long id) {
        return repository.findById(id);
    }

    public List<Assignment> findByComponentId(Long idComponent) {
        // Toate assignments pentru un anumit component
        return repository.getAll().stream()
                .filter(t -> t.getIdComponent().equals(idComponent))
                .toList();
    }

    public List<Assignment> findByFlightId(Long idFlight) {
        // Toate assignments pentru un anumit flight
        return repository.getAll().stream()
                .filter(t -> t.getIdFlight().equals(idFlight))
                .toList();
    }

    public List<Assignment> getAll() {
        return repository.getAll();
    }

    public List<Component> findByTypeAndInterval(String type, LocalDateTime intervalStart, LocalDateTime intervalEnd) {
        if (type == null || intervalStart == null || intervalEnd == null) {
            throw new IllegalArgumentException("Type și intervalul nu pot fi null");
        }

        return componentService.getAll().stream()
                .filter(c -> type.equals(c.getType())) // filtrează după tip
                .filter(c -> {
                    // intervalul componentei trebuie să includă complet intervalul cerut
                    return !c.getStart().isAfter(intervalStart) && !c.getEnd().isBefore(intervalEnd);
                })
                .toList();
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

    public List<Assignment> findAssignmentsByFlightId(Long flightId) {
        if (flightId == null) {
            throw new IllegalArgumentException("flightId nu poate fi null");
        }
        return repository.getAll().stream()
                .filter(a -> a.getIdFlight().equals(flightId))
                .toList();
    }

}