package com.university.models;

public class AdminCourseDTO {
    private String courseId;
    private String title;
    private String deptName;
    private int credits;
    private int activeSections;
    private String activeSemesters;

    public AdminCourseDTO(String courseId, String title, String deptName, int credits, int activeSections, String activeSemesters) {
        this.courseId = courseId;
        this.title = title;
        this.deptName = deptName;
        this.credits = credits;
        this.activeSections = activeSections;
        this.activeSemesters = activeSemesters;
    }

    public String getCourseId() { return courseId; }
    public String getTitle() { return title; }
    public String getDeptName() { return deptName; }
    public int getCredits() { return credits; }
    public int getActiveSections() { return activeSections; }
    public String getActiveSemesters() { return activeSemesters; }
}
