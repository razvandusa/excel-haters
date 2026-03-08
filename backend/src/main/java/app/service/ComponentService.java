package app.service;

import app.domain.Component;
import app.domain.Terminal;
import app.dto.component.CreateComponentRequest;
import app.dto.component.UpdateComponentRequest;
import app.repository.ComponentDBRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComponentService {

    private final ComponentDBRepository repository;

    public ComponentService(ComponentDBRepository repository) {
        this.repository = repository;
    }

    public void add(Long terminalId, CreateComponentRequest componentRequest) {
        Component component = new Component();
        component.setName(componentRequest.getName());
        component.setType(componentRequest.getType());
        component.setActive(componentRequest.getIsActive());
        component.setTerminalId(terminalId);

        // Verificare ca numele componentei sa nu fie null
        if (component.getName() == null || component.getName().isBlank()) {
            throw new IllegalArgumentException("Numele componentei nu poate fi gol");
        }

        // Verificare ca tipul componentei sa nu fie null
        if (component.getType() == null || component.getType().isBlank()) {
            throw new IllegalArgumentException("Tipul componentului nu poate fi gol");
        }

        // Verificare ca componenta sa aiba un terminal valid asignat
        Boolean exists = repository.findTerminalById(component.getTerminalId());
        if (!exists) {
            throw new IllegalArgumentException("Terminalul cu id-ul " + component.getTerminalId() + " nu există");
        }

        // Verificare ca terminalul sa nu contina deja componenta in el
        List<Component> existingComponents = repository.getAll();
        boolean duplicateInTerminal = existingComponents.stream()
                .anyMatch(c -> c.getTerminalId().equals(component.getTerminalId()) &&
                        c.getName().equalsIgnoreCase(component.getName()));
        if (duplicateInTerminal) {
            throw new IllegalArgumentException("Componenta cu numele " + component.getName() +
                    " există deja în terminalul " + component.getTerminalId());
        }

        // Verificare ca tipul componentei sa fie valid
        String type = component.getType().toUpperCase();
        if (!type.equals("GATE") && !type.equals("DESK") && !type.equals("SECURITY") && !type.equals("STAND")) {
            throw new IllegalArgumentException("Tipul componentului trebuie să fie GATE, DESK, SECURITY sau STAND");
        }
        component.setType(type); // 'type' is already uppercased from the validation above
        repository.save(component);
    }

    public void remove(Long id) {

        // Verificare daca componenta exista
        Component component = repository.findById(id);
        if (component == null) {
            throw new IllegalArgumentException("Componenta cu id-ul " + id + " nu există și nu poate fi ștearsă");
        }

        repository.deleteById(id);
    }

    public void update(Long id, UpdateComponentRequest updateComponentRequest) {
        // Verificare daca componenta exista
        Component component = repository.findById(id);
        if (component == null) {
            throw new IllegalArgumentException("Componenta cu id-ul " + id + " nu există");
        }

        // Verificare ca numele pe care vrem sa il setam exista si nu e gol
        if (updateComponentRequest.getName() != null && !updateComponentRequest.getName().isBlank()) {
            component.setName(updateComponentRequest.getName());
        }

        if (updateComponentRequest.getIsActive() != null) {
            component.setActive(updateComponentRequest.getIsActive());
        }

        repository.update(component);
    }

    public Component findById(Long id) {
        return repository.findById(id);
    }

    public Component findByName(String name) {
        return repository.findByName(name);
    }

    public List<Component> getAll() {
        return repository.getAll();
    }

    public List<Component> getAllByTerminalId(Long terminalId) {
        if (terminalId == null) {
            throw new IllegalArgumentException("TerminalId nu poate fi null");
        }

        return repository.getAll().stream()
                .filter(c -> c.getTerminalId().equals(terminalId))
                .toList();
    }
}