package com.university.dao;

import com.university.db.DatabaseConnection;
import com.university.models.AdminCourseDTO;
import com.university.models.AdminStudentDTO;
import com.university.models.AvailableCourse;
import com.university.models.StudentHistory;
import com.university.models.Student;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

public class RegistrationDAO {

    public Student getStudent(String studentId) throws SQLException {
        String query = "SELECT ID, name, branch_name, tot_cred, current_semester FROM Student WHERE ID = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, studentId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return new Student(
                        rs.getString("ID"),
                        rs.getString("name"),
                        rs.getString("branch_name"),
                        rs.getInt("tot_cred"),
                        rs.getInt("current_semester")
                    );
                }
            }
        }
        return null;
    }

    public void registerStudent(String id, String name, String branchName, int semester) throws SQLException {
        String query = "INSERT INTO Student (ID, name, branch_name, current_semester) VALUES (?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, id);
            stmt.setString(2, name);
            stmt.setString(3, branchName);
            stmt.setInt(4, semester);
            stmt.executeUpdate();
        }
    }

    public void addCourse(String courseId, String title, String deptName, int credits, int semester, String prereqId) throws SQLException {
        String q1 = "INSERT INTO Course (course_id, title, dept_name, credits) VALUES (?, ?, ?, ?)";
        String q2 = "INSERT INTO Section (course_id, sec_id, semester, year, instructor_id, time_slot_id, capacity, enrolled) VALUES (?, '1', ?, 2026, '101', 'T1', 60, 0)";
        String q3 = "INSERT INTO Prereq (course_id, prereq_id) VALUES (?, ?)";

        try (Connection conn = DatabaseConnection.getConnection()) {
            conn.setAutoCommit(false);
            try (PreparedStatement stmt1 = conn.prepareStatement(q1);
                 PreparedStatement stmt2 = conn.prepareStatement(q2)) {

                stmt1.setString(1, courseId);
                stmt1.setString(2, title);
                stmt1.setString(3, deptName);
                stmt1.setInt(4, credits);
                stmt1.executeUpdate();

                stmt2.setString(1, courseId);
                stmt2.setInt(2, semester);
                stmt2.executeUpdate();

                // Optionally insert prerequisite
                if (prereqId != null && !prereqId.trim().isEmpty()) {
                    try (PreparedStatement stmt3 = conn.prepareStatement(q3)) {
                        stmt3.setString(1, courseId);
                        stmt3.setString(2, prereqId.trim().toUpperCase());
                        stmt3.executeUpdate();
                    }
                }

                conn.commit();
            } catch (SQLException e) {
                conn.rollback();
                throw e;
            } finally {
                conn.setAutoCommit(true);
            }
        }
    }

    public List<AvailableCourse> getAvailableCourses(int semester, int year) throws SQLException {
        List<AvailableCourse> courses = new ArrayList<>();
        String call = "{ ? = call pkg_registration.GetAvailableCourses(?, ?) }";
        
        try (Connection conn = DatabaseConnection.getConnection();
             CallableStatement stmt = conn.prepareCall(call)) {
             
            stmt.registerOutParameter(1, Types.REF_CURSOR);
            stmt.setInt(2, semester);
            stmt.setInt(3, year);
            stmt.execute();
            
            try (ResultSet rs = (ResultSet) stmt.getObject(1)) {
                while (rs.next()) {
                    courses.add(new AvailableCourse(
                            rs.getString("course_id"),
                            rs.getString("title"),
                            rs.getString("sec_id"),
                            rs.getString("instructor_name"),
                            rs.getInt("capacity"),
                            rs.getInt("enrolled"),
                            rs.getString("day"),
                            rs.getString("start_time"),
                            rs.getString("end_time")
                    ));
                }
            }
        }
        return courses;
    }

    public List<StudentHistory> getStudentHistory(String studentId) throws SQLException {
        List<StudentHistory> history = new ArrayList<>();
        String call = "{ ? = call pkg_registration.GetStudentHistory(?) }";
        
        try (Connection conn = DatabaseConnection.getConnection();
             CallableStatement stmt = conn.prepareCall(call)) {
             
            stmt.registerOutParameter(1, Types.REF_CURSOR);
            stmt.setString(2, studentId);
            stmt.execute();
            
            try (ResultSet rs = (ResultSet) stmt.getObject(1)) {
                while (rs.next()) {
                    history.add(new StudentHistory(
                            rs.getString("course_id"),
                            rs.getString("title"),
                            String.valueOf(rs.getInt("sem_term")),
                            rs.getInt("year"),
                            rs.getString("grade"),
                            rs.getInt("credits")
                    ));
                }
            }
        }
        return history;
    }

    public List<AdminCourseDTO> getMasterCourseList() throws SQLException {
        List<AdminCourseDTO> courses = new ArrayList<>();
        String query = 
            "SELECT c.course_id, c.title, c.dept_name, c.credits, " +
            "COUNT(s.sec_id) as active_sections, " +
            "LISTAGG(DISTINCT s.semester, ', ') WITHIN GROUP (ORDER BY s.semester) AS active_semesters " +
            "FROM Course c " +
            "LEFT JOIN Section s ON c.course_id = s.course_id " +
            "GROUP BY c.course_id, c.title, c.dept_name, c.credits " +
            "ORDER BY c.dept_name ASC, c.course_id ASC";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                courses.add(new AdminCourseDTO(
                        rs.getString("course_id"),
                        rs.getString("title"),
                        rs.getString("dept_name"),
                        rs.getInt("credits"),
                        rs.getInt("active_sections"),
                        rs.getString("active_semesters")
                ));
            }
        }
        return courses;
    }

    public List<AdminStudentDTO> getAllStudentEnrollments() throws SQLException {
        Map<String, AdminStudentDTO> studentMap = new LinkedHashMap<>();
        String call = "{ ? = call pkg_registration.GetAllStudentEnrollments() }";
        
        try (Connection conn = DatabaseConnection.getConnection();
             CallableStatement stmt = conn.prepareCall(call)) {
             
            stmt.registerOutParameter(1, Types.REF_CURSOR);
            stmt.execute();
            
            try (ResultSet rs = (ResultSet) stmt.getObject(1)) {
                while (rs.next()) {
                    String studentId = rs.getString("ID");
                    AdminStudentDTO dto = studentMap.get(studentId);
                    if (dto == null) {
                        dto = new AdminStudentDTO(
                            studentId, 
                            rs.getString("student_name"), 
                            rs.getString("branch_name"), 
                            rs.getInt("current_semester")
                        );
                        studentMap.put(studentId, dto);
                    }
                    String courseId = rs.getString("course_id");
                    if (courseId != null) {
                        dto.addEnrollment(courseId, rs.getString("course_title"));
                    }
                }
            }
        }
        return new ArrayList<>(studentMap.values());
    }

    public void enrollStudent(String studentId, String courseId, String secId, int semester, int year) throws SQLException {
        String call = "{ call pkg_registration.EnrollStudent(?, ?, ?, ?, ?) }";
        try (Connection conn = DatabaseConnection.getConnection();
             CallableStatement stmt = conn.prepareCall(call)) {
            stmt.setString(1, studentId);
            stmt.setString(2, courseId);
            stmt.setString(3, secId);
            stmt.setInt(4, semester);
            stmt.setInt(5, year);
            stmt.execute();
        }
    }

    public void dropCourse(String studentId, String courseId, String secId, int semester, int year) throws SQLException {
        String call = "{ call pkg_registration.DropCourse(?, ?, ?, ?, ?) }";
        try (Connection conn = DatabaseConnection.getConnection();
             CallableStatement stmt = conn.prepareCall(call)) {
            stmt.setString(1, studentId);
            stmt.setString(2, courseId);
            stmt.setString(3, secId);
            stmt.setInt(4, semester);
            stmt.setInt(5, year);
            stmt.execute();
        }
    }
}
