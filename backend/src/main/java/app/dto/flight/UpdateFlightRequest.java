package app.dto.flight;

public class UpdateFlightRequest {
    private String departureTime;
    private String arrivalTime;

    public String getDepartureTime() { return departureTime; }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }
}