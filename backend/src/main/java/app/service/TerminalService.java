package app.service;

import app.domain.Terminal;
import app.dto.terminal.CreateTerminalRequest;
import app.dto.terminal.UpdateTerminalRequest;
import app.repository.TerminalDBRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TerminalService {

    private final TerminalDBRepository repository;

    public TerminalService(TerminalDBRepository repository) {
        this.repository = repository;
    }

    public void add(CreateTerminalRequest terminalRequest) {
        Terminal terminal = new Terminal();
        terminal.setName(terminalRequest.getName());

        // Verificare ca numele terminalului nu fie null sau gol
        if (terminal.getName() == null || terminal.getName().isBlank()) {
            throw new IllegalArgumentException("Numele terminalului nu poate fi gol");
        }

        // Verificare ca numele terminalului sa fie unic
        Terminal existing = repository.findByName(terminal.getName());
        if (existing != null) {
            throw new IllegalArgumentException(
                    "Terminal cu numele '" + terminal.getName() + "' există deja"
            );
        }

        // Setam sa nu fie activ terminalul cand il adaugam
        terminal.setActive(terminalRequest.getIsActive());

        repository.save(terminal);
    }

    public void remove(Long id) {
        // Verificare daca terminalul exista
        Terminal terminal = repository.findById(id);
        if (terminal == null) {
            throw new IllegalArgumentException("Terminal with id " + id + " does not exist");
        }
        repository.deleteById(id);
    }

    public void update(Long id, UpdateTerminalRequest updateTerminalRequest) {
        String name = updateTerminalRequest.getName();
        Boolean active = updateTerminalRequest.getIsActive();
        // Verificare daca terminalul exista
        Terminal terminal = repository.findById(id);
        if (terminal != null) {
            // Verificare daca exista un nou nume pentru terminal
            if (name != null && !name.isBlank()) {
                terminal.setName(name);
            }
            // Verificare daca exista un nou status pentru terminal
            if (active != null) {
                terminal.setActive(active);
            }
            repository.update(terminal);
        }
    }

    public Terminal findById(Long id) {
        return repository.findById(id);
    }

    public Terminal findByName(String name) {
        return repository.findByName(name);
    }

    public List<Terminal> getAll() {
        return repository.getAll();
    }
}