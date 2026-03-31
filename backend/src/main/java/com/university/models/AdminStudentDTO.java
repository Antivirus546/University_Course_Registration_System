package com.university.models;

import java.util.ArrayList;
import java.util.List;

public class AdminStudentDTO {
    private String studentId;
    private String name;
    private String branchName;
    private int currentSemester;
    private List<CourseRegistration> enrollments;

    public AdminStudentDTO(String studentId, String name, String branchName, int currentSemester) {
        this.studentId = studentId;
        this.name = name;
        this.branchName = branchName;
        this.currentSemester = currentSemester;
        this.enrollments = new ArrayList<>();
    }

    public void addEnrollment(String courseId, String title) {
        this.enrollments.add(new CourseRegistration(courseId, title));
    }

    public String getStudentId() { return studentId; }
    public String getName() { return name; }
    public String getBranchName() { return branchName; }
    public int getCurrentSemester() { return currentSemester; }
    public List<CourseRegistration> getEnrollments() { return enrollments; }

    public static class CourseRegistration {
        private String courseId;
        private String title;

        public CourseRegistration(String courseId, String title) {
            this.courseId = courseId;
            this.title = title;
        }

        public String getCourseId() { return courseId; }
        public String getTitle() { return title; }
    }
}
