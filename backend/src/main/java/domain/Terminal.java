package domain;

import java.util.ArrayList;
import java.util.List;

public class Terminal {
    Long id;
    String name;
    Boolean active;
    List<Assignment> components = new ArrayList<>();

    public Terminal(String name, Boolean active) {
        this.name = name;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public List<Assignment> getComponents() {
        return components;
    }

    public void setComponents(List<Assignment> components) {
        this.components = components;
    }

    public void addComponent(Assignment component) {
        this.components.add(component);
    }
}
