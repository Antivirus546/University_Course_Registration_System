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

    public void registerStudent(String id, String name, String branchName, int semester, List<String> completedCourseIds) throws SQLException {
        String qStudent = "INSERT INTO Student (ID, name, branch_name, current_semester) VALUES (?, ?, ?, ?)";
        String qCheckGhost = "SELECT COUNT(*) FROM Section WHERE course_id = ? AND sec_id = '0' AND semester = 1 AND year = 2025";
        String qInsertGhost = "INSERT INTO Section (course_id, sec_id, semester, year, instructor_id, time_slot_id, capacity, enrolled) VALUES (?, '0', 1, 2025, NULL, NULL, 999, 0)";
        String qInsertTakes = "INSERT INTO Takes (ID, course_id, sec_id, semester, year, grade) VALUES (?, ?, '0', 1, 2025, 'A')";

        Connection conn = null;
        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false);
            
            try (PreparedStatement stmtStudent = conn.prepareStatement(qStudent)) {
                stmtStudent.setString(1, id);
                stmtStudent.setString(2, name);
                stmtStudent.setString(3, branchName);
                stmtStudent.setInt(4, semester);
                stmtStudent.executeUpdate();
            }

            if (completedCourseIds != null && !completedCourseIds.isEmpty()) {
                try (PreparedStatement stmtCheckGhost = conn.prepareStatement(qCheckGhost);
                     PreparedStatement stmtInsertGhost = conn.prepareStatement(qInsertGhost);
                     PreparedStatement stmtInsertTakes = conn.prepareStatement(qInsertTakes)) {
                     
                    for (String courseId : completedCourseIds) {
                        stmtCheckGhost.setString(1, courseId);
                        boolean ghostExists = false;
                        try (ResultSet rs = stmtCheckGhost.executeQuery()) {
                            if (rs.next() && rs.getInt(1) > 0) {
                                ghostExists = true;
                            }
                        }
                        
                        if (!ghostExists) {
                            stmtInsertGhost.setString(1, courseId);
                            stmtInsertGhost.executeUpdate();
                        }
                        
                        stmtInsertTakes.setString(1, id);
                        stmtInsertTakes.setString(2, courseId);
                        stmtInsertTakes.executeUpdate();
                    }
                }
            }
            conn.commit();
        } catch (SQLException e) {
            if (conn != null) {
                try { conn.rollback(); } catch (SQLException ex) {}
            }
            throw e;
        } finally {
            if (conn != null) {
                try {
                    conn.setAutoCommit(true);
                    conn.close();
                } catch (SQLException ex) {}
            }
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
