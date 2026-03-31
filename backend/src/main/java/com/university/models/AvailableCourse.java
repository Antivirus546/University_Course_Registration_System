package com.university.models;

public class AvailableCourse {
    private String courseId;
    private String title;
    private String secId;
    private String instructorName;
    private int capacity;
    private int enrolled;
    private String day;
    private String startTime;
    private String endTime;

    public AvailableCourse(String courseId, String title, String secId, String instructorName, int capacity, int enrolled, String day, String startTime, String endTime) {
        this.courseId = courseId;
        this.title = title;
        this.secId = secId;
        this.instructorName = instructorName;
        this.capacity = capacity;
        this.enrolled = enrolled;
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Getters
    public String getCourseId() { return courseId; }
    public String getTitle() { return title; }
    public String getSecId() { return secId; }
    public String getInstructorName() { return instructorName; }
    public int getCapacity() { return capacity; }
    public int getEnrolled() { return enrolled; }
    public String getDay() { return day; }
    public String getStartTime() { return startTime; }
    public String getEndTime() { return endTime; }

    @Override
    public String toString() {
        return String.format("%s - %s (S: %s) [%s] <%s-%s> Seats: %d/%d", 
            courseId, title, secId, instructorName, day, startTime, endTime, enrolled, capacity);
    }
}
