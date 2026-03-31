package com.university.models;

public class StudentHistory {
    private String courseId;
    private String title;
    private String semester;
    private int year;
    private String grade;
    private int credits;

    public StudentHistory(String courseId, String title, String semester, int year, String grade, int credits) {
        this.courseId = courseId;
        this.title = title;
        this.semester = semester;
        this.year = year;
        this.grade = grade;
        this.credits = credits;
    }

    public String getCourseId() { return courseId; }
    public String getTitle() { return title; }
    public String getSemester() { return semester; }
    public int getYear() { return year; }
    public String getGrade() { return grade; }
    public int getCredits() { return credits; }

    @Override
    public String toString() {
        return String.format("%s - %s | %s %d | Grade: %s | Credits: %d", 
                courseId, title, semester, year, (grade == null ? "Enrolled" : grade), credits);
    }
}
