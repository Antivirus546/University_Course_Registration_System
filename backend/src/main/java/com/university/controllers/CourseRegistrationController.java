package com.university.controllers;

import com.university.dao.RegistrationDAO;
import com.university.models.AdminCourseDTO;
import com.university.models.AdminStudentDTO;
import com.university.models.AvailableCourse;
import com.university.models.StudentHistory;
import com.university.models.Student;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allows 192.168.0.195 or localhost uniformly
public class CourseRegistrationController {

    private final RegistrationDAO dao = new RegistrationDAO();

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String id = request.get("studentId");
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please enter a valid Student ID"));
        }
        try {
            Student student = dao.getStudent(id.trim());
            if (student != null) {
                return ResponseEntity.ok(Map.of(
                    "success", true, 
                    "studentId", student.getId(),
                    "currentSemester", student.getCurrentSemester()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Student ID not found in database."));
            }
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Database Error: " + e.getMessage()));
        }
    }

    @PostMapping("/students")
    public ResponseEntity<?> registerStudent(@RequestBody Map<String, Object> request) {
        String id = (String) request.get("id");
        String name = (String) request.get("name");
        String branch = (String) request.get("branchName");
        
        if (id == null || name == null || branch == null || request.get("semester") == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
        }

        try {
            int semester = Integer.parseInt(request.get("semester").toString());
            List<String> completedCourseIds = null;
            if (request.get("completedCourseIds") instanceof List) {
                completedCourseIds = (List<String>) request.get("completedCourseIds");
            }
            dao.registerStudent(id, name, branch, semester, completedCourseIds);
            return ResponseEntity.ok(Map.of("message", "Student Registered Successfully!"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Semester must be a number"));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Database Error: " + e.getMessage()));
        }
    }

    @PostMapping("/courses")
    public ResponseEntity<?> addCourse(@RequestBody Map<String, String> request) {
        String courseId = request.get("courseId");
        String title = request.get("title");
        String deptName = request.get("deptName");
        String semesterType = request.get("semesterType");
        
        if (courseId == null || title == null || deptName == null || request.get("credits") == null || semesterType == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields are required"));
        }
        
        try {
            int credits = Integer.parseInt(request.get("credits"));
            int semesterRaw = Integer.parseInt(semesterType);
            String prereqId = request.getOrDefault("prereqId", "");
            dao.addCourse(courseId, title, deptName, credits, semesterRaw, prereqId);
            return ResponseEntity.ok(Map.of("message", "Course Added Successfully!"));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Credits and Semester must be a number"));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to add course: " + e.getMessage()));
        }
    }

    @GetMapping("/courses")
    public ResponseEntity<?> getAvailableCourses(@RequestParam(defaultValue = "1") int term) {
        try {
            List<AvailableCourse> courses = dao.getAvailableCourses(term, 2026);
            return ResponseEntity.ok(courses);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error loading courses: " + e.getMessage()));
        }
    }

    @GetMapping("/students/{studentId}/history")
    public ResponseEntity<?> getStudentHistory(@PathVariable String studentId) {
        try {
            List<StudentHistory> history = dao.getStudentHistory(studentId);
            return ResponseEntity.ok(history);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error loading history: " + e.getMessage()));
        }
    }

    @GetMapping("/admin/courses")
    public ResponseEntity<?> getAllAdminCourses() {
        try {
            List<AdminCourseDTO> courses = dao.getMasterCourseList();
            return ResponseEntity.ok(courses);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error loading master courses: " + e.getMessage()));
        }
    }

    @GetMapping("/admin/students")
    public ResponseEntity<?> getAllStudentEnrollments() {
        try {
            List<AdminStudentDTO> students = dao.getAllStudentEnrollments();
            return ResponseEntity.ok(students);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error loading student enrollments: " + e.getMessage()));
        }
    }

    @PostMapping("/students/{studentId}/enroll")
    public ResponseEntity<?> enrollStudent(@PathVariable String studentId, @RequestBody Map<String, String> request) {
        String courseId = request.get("courseId");
        String secId = request.get("secId");
        String semesterStr = request.get("semester");
        
        if (courseId == null || secId == null || semesterStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Course ID, Section ID, and Semester are required"));
        }
        try {
            int semester = Integer.parseInt(semesterStr);
            Student student = dao.getStudent(studentId);
            if (student == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid student"));
            }
            if (student.getCurrentSemester() != semester) {
                return ResponseEntity.badRequest().body(Map.of("message", "Cannot join courses outside your active semester mapping (Semester " + student.getCurrentSemester() + ")"));
            }

            dao.enrollStudent(studentId, courseId, secId, semester, 2026);
            return ResponseEntity.ok(Map.of("message", "Registered successfully for " + courseId));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Semester parameter is not valid"));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", extractOracleError(e.getMessage())));
        }
    }

    @PostMapping("/students/{studentId}/drop")
    public ResponseEntity<?> dropCourse(@PathVariable String studentId, @RequestBody Map<String, String> request) {
        String courseId = request.get("courseId");
        String secId = request.getOrDefault("secId", "1");
        String semesterStr = request.get("semester");
        int year;
        
        if (courseId == null || semesterStr == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Course ID, and Semester are required"));
        }

        try {
            year = Integer.parseInt(request.get("year"));
            int semester = Integer.parseInt(semesterStr);
            dao.dropCourse(studentId, courseId, secId, semester, year);
            return ResponseEntity.ok(Map.of("message", "Dropped successfully from " + courseId));
        } catch (NumberFormatException | NullPointerException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Valid year and numeric semester is required"));
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", extractOracleError(e.getMessage())));
        }
    }

    private String extractOracleError(String fullMessage) {
        if (fullMessage.contains("ORA-20001")) return "Course section is full. Registration denied.";
        if (fullMessage.contains("ORA-20002")) return "Prerequisites for this course are not met.";
        if (fullMessage.contains("ORA-20003")) return "Schedule clash detected with an existing registration.";
        if (fullMessage.contains("ORA-20004")) return "Cannot drop this course. Not currently registered.";
        if (fullMessage.contains("ORA-20005")) return "Student does not exist.";
        return fullMessage; // Return fully if not matched
    }
}
