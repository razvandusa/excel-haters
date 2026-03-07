package app.service;

import app.domain.Terminal;

import java.util.List;

public class TerminalService {

    private final TerminalDBRepository repository;

    public TerminalService(TerminalDBRepository repository) {
        this.repository = repository;
    }

    public void add(Terminal terminal) {
        // Verificare ca terminalul sa nu fie null
        if (terminal == null) {
            throw new IllegalArgumentException("Terminalul nu poate fi null");
        }

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
        terminal.setActive(false);

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

    public void update(Long id, String name, Boolean active) {
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