package app.service;

import app.domain.Component;
import app.domain.Terminal;

import java.util.List;

public class ComponentService {

    private final ComponentsDBRepository repository;

    public ComponentService(ComponentsDBRepository repository) {
        this.repository = repository;
    }

    public void add(Component component) {
        // Verificare ca componenta sa nu fie null
        if (component == null) {
            throw new IllegalArgumentException("Componentul nu poate fi null");
        }

        // Verificare ca numele componentei sa nu fie null
        if (component.getName() == null || component.getName().isBlank()) {
            throw new IllegalArgumentException("Numele componentei nu poate fi gol");
        }

        // Verificare ca tipul componentei sa nu fie null
        if (component.getType() == null || component.getType().isBlank()) {
            throw new IllegalArgumentException("Tipul componentului nu poate fi gol");
        }

        // Verificare ca componenta sa aiba un terminal valid asignat
        Terminal terminal = repository.findTerminalById(component.getTerminalId());
        if (terminal == null) {
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

        // Setam sa nu fie activa componenta cand o adaugam
        component.setActive(false);

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

    public void update(Long id, String name, Boolean active) {
        // Verificare daca componenta exista
        Component component = repository.findById(id);
        if (component == null) {
            throw new IllegalArgumentException("Componenta cu id-ul " + id + " nu există");
        }

        // Verificare ca numele pe care vrem sa il setam exista si nu e gol
        if (name != null && !name.isBlank()) {
            component.setName(name);
        }

        // Verificare ca statusul de active care vrem sa il setam exista
        if (active != null) {
            component.setActive(active);
        }

        repository.update(component);
    }

    public Component findById(Long id) {
        return repository.findById(id);
    }

    public Long findByName(String name) {
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