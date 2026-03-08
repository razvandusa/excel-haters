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

    public void scheduleAssignmentForFlight(
            String flightId,
            String deskName,
            String securityName,
            String gateName,
            String standName
    ) {
        var flight = flightService.findById(flightId);
        if (flight == null) {
            throw new IllegalArgumentException("Flight not found");
        }

        LocalDateTime referenceTime;

        if (flight.getArrival() != null) {
            referenceTime = flight.getArrival();
        } else if (flight.getDeparture() != null) {
            referenceTime = flight.getDeparture();
        } else {
            throw new IllegalStateException("Flight has no arrival or departure time");
        }

        LocalDateTime start = referenceTime;
        LocalDateTime end = start.plusHours(4);

        // Obținem componentele specificate ca input (dacă există)
        Component deskInput = deskName != null ? componentService.findByName(deskName) : null;
        Component securityInput = securityName != null ? componentService.findByName(securityName) : null;
        Component gateInput = gateName != null ? componentService.findByName(gateName) : null;
        Component standInput = standName != null ? componentService.findByName(standName) : null;

        // Verificare preliminară: dacă toate input-urile sunt libere în interval, salvăm direct
        boolean deskFree = deskInput == null || isComponentFreeInInterval(deskInput, start, end);
        boolean securityFree = securityInput == null || isComponentFreeInInterval(securityInput, start, end);
        boolean gateFree = gateInput == null || isComponentFreeInInterval(gateInput, start, end);
        boolean standFree = standInput == null || isComponentFreeInInterval(standInput, start, end);

        if (deskFree && securityFree && gateFree && standFree) {
            if (deskInput != null) saveAssignment(flightId, deskInput, start, end);
            if (securityInput != null) saveAssignment(flightId, securityInput, start, end);
            if (gateInput != null) saveAssignment(flightId, gateInput, start, end);
            if (standInput != null) saveAssignment(flightId, standInput, start, end);
            return; // toate assignments salvate, ieșim
        }

        // Dacă nu toate componentele input sunt libere, intrăm în backtracking
        LocalDateTime intervalStart = referenceTime.minusDays(1);
        LocalDateTime intervalEnd   = referenceTime.plusDays(7);

        List<Component> desks = findByTypeAndInterval("DESK", intervalStart.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), intervalEnd.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        List<Component> securities = findByTypeAndInterval("SECURITY", intervalStart.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), intervalEnd.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        List<Component> gates = findByTypeAndInterval("GATE", intervalStart.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), intervalEnd.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        List<Component> stands = findByTypeAndInterval("STAND", intervalStart.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME), intervalEnd.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        boolean scheduled = false;

        for (Component desk : desks) {
            if (deskInput != null && !desk.equals(deskInput)) continue;
            if (!isComponentFreeInInterval(desk, start, end)) continue;

            for (Component security : securities) {
                if (securityInput != null && !security.equals(securityInput)) continue;
                if (!isComponentFreeInInterval(security, start, end)) continue;

                for (Component gate : gates) {
                    if (gateInput != null && !gate.equals(gateInput)) continue;
                    if (!isComponentFreeInInterval(gate, start, end)) continue;

                    for (Component stand : stands) {
                        if (standInput != null && !stand.equals(standInput)) continue;
                        if (!isComponentFreeInInterval(stand, start, end)) continue;

                        // Am găsit combinația completă
                        LocalDateTime deskStart, deskEnd, securityStart, securityEnd, gateStart, gateEnd, standStart, standEnd;

                        if (flight.getDeparture() != null) {
                            deskStart = flight.getDeparture().minusHours(4);
                            deskEnd = flight.getDeparture().minusHours(2);
                            securityStart = flight.getDeparture().minusHours(3);
                            securityEnd = flight.getDeparture().minusHours(2);
                            gateStart = flight.getDeparture().minusHours(2);
                            gateEnd = flight.getDeparture().minusMinutes(15);
                            standStart = flight.getDeparture().minusHours(1);
                            standEnd = flight.getDeparture().plusMinutes(15);
                        } else {
                            deskStart = flight.getArrival().minusMinutes(30);
                            deskEnd = flight.getArrival().plusMinutes(120);
                            securityStart = flight.getArrival().plusMinutes(15);
                            securityEnd = flight.getArrival().plusMinutes(90);
                            gateStart = flight.getArrival();
                            gateEnd = flight.getArrival().plusHours(1);
                            standStart = flight.getArrival().minusHours(1);
                            standEnd = flight.getArrival().plusMinutes(15);
                        }

                        saveAssignment(flightId, desk, deskStart, deskEnd);
                        saveAssignment(flightId, security, securityStart, securityEnd);
                        saveAssignment(flightId, gate, gateStart, gateEnd);
                        saveAssignment(flightId, stand, standStart, standEnd);
                        scheduled = true;
                        break;
                    }
                    if (scheduled) break;
                }
                if (scheduled) break;
            }
            if (scheduled) break;
        }

        if (!scheduled) {
            throw new IllegalStateException("No valid combination of components found for flight " + flightId);
        }
    }

    private void saveAssignment(String flightId, Component component, LocalDateTime start, LocalDateTime end) {
        Assignment a = new Assignment();
        a.setIdFlight(flightId);
        a.setIdComponent(component.getId());
        a.setStart(start);
        a.setEnd(end);
        repository.save(a);
    }
}