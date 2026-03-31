-- ==============================================================================
-- Phase 2: PL/SQL Business Logic (Triggers, Cursors, Procedures)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TRIGGERS for Registration Logic
-- ------------------------------------------------------------------------------
SET DEFINE OFF;

CREATE OR REPLACE TRIGGER trg_check_registration_rules
BEFORE INSERT ON Takes
FOR EACH ROW
DECLARE
    v_prereq_count NUMBER;
    v_completed_count NUMBER;
    v_capacity NUMBER;
    v_enrolled NUMBER;
    v_clash_count NUMBER;
    v_time_slot VARCHAR2(10);
    v_student_exists NUMBER;
BEGIN
    -- 1. Check if student exists
    SELECT COUNT(*) INTO v_student_exists FROM Student WHERE ID = :NEW.ID;
    IF v_student_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20005, 'Student does not exist.');
    END IF;

    -- 2. Check Seat Limits (Capacity)
    SELECT capacity, enrolled, time_slot_id 
    INTO v_capacity, v_enrolled, v_time_slot
    FROM Section 
    WHERE course_id = :NEW.course_id 
      AND sec_id = :NEW.sec_id 
      AND semester = :NEW.semester 
      AND year = :NEW.year;
      
    IF v_enrolled >= v_capacity THEN
        RAISE_APPLICATION_ERROR(-20001, 'Course section is full. Registration denied.');
    END IF;

    -- 3. Check Prerequisites Completion
    -- Subquery checks how many prereqs exist for this course 
    -- that the student has NOT successfully completed.
    SELECT COUNT(*)
    INTO v_prereq_count
    FROM Prereq p
    WHERE p.course_id = :NEW.course_id
      AND p.prereq_id NOT IN (
          SELECT t.course_id 
          FROM Takes t 
          WHERE t.ID = :NEW.ID 
            AND t.grade IS NOT NULL 
            AND t.grade NOT IN ('F', 'F-') -- Assuming F means not completed
      );
      
    IF v_prereq_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Prerequisites for this course are not met.');
    END IF;

    -- 4. Check Schedule Clashes
    -- Find if the student is already registered for a section in the same semester & year 
    -- that shares the exact same time_slot_id.
    IF v_time_slot IS NOT NULL THEN
        SELECT COUNT(*)
        INTO v_clash_count
        FROM Takes t
        JOIN Section s ON t.course_id = s.course_id 
                       AND t.sec_id = s.sec_id 
                       AND t.semester = s.semester 
                       AND t.year = s.year
        WHERE t.ID = :NEW.ID 
          AND t.semester = :NEW.semester 
          AND t.year = :NEW.year
          AND s.time_slot_id = v_time_slot;
          
        IF v_clash_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20003, 'Schedule clash detected with an existing registration.');
        END IF;
    END IF;
    
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20006, 'Course section or schedule details not found.');
END;
/

-- Trigger to increment enrollment count AFTER successful registration
CREATE OR REPLACE TRIGGER trg_increment_enrolled
AFTER INSERT ON Takes
FOR EACH ROW
BEGIN
    UPDATE Section 
    SET enrolled = enrolled + 1 
    WHERE course_id = :NEW.course_id 
      AND sec_id = :NEW.sec_id 
      AND semester = :NEW.semester 
      AND year = :NEW.year;
END;
/

-- Trigger to decrement enrollment count AFTER course drop
CREATE OR REPLACE TRIGGER trg_decrement_enrolled
AFTER DELETE ON Takes
FOR EACH ROW
BEGIN
    UPDATE Section 
    SET enrolled = enrolled - 1 
    WHERE course_id = :OLD.course_id 
      AND sec_id = :OLD.sec_id 
      AND semester = :OLD.semester 
      AND year = :OLD.year;
END;
/

-- ------------------------------------------------------------------------------
-- 2. PACKAGE & PROCEDURES (Includes Cursor Usage)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE PACKAGE pkg_registration IS
    PROCEDURE EnrollStudent(p_student_id IN VARCHAR2, p_course_id IN VARCHAR2, p_sec_id IN VARCHAR2, p_semester IN VARCHAR2, p_year IN NUMBER);
    PROCEDURE DropCourse(p_student_id IN VARCHAR2, p_course_id IN VARCHAR2, p_sec_id IN VARCHAR2, p_semester IN VARCHAR2, p_year IN NUMBER);
    
    -- A strongly typed ref cursor for fetching records
    TYPE t_record_cursor IS REF CURSOR;
    FUNCTION GetStudentHistory(p_student_id IN VARCHAR2) RETURN t_record_cursor;
    FUNCTION GetAvailableCourses(p_semester IN VARCHAR2, p_year IN NUMBER) RETURN t_record_cursor;
END pkg_registration;
/

CREATE OR REPLACE PACKAGE BODY pkg_registration IS

    -- Procedure to Enroll a Student
    PROCEDURE EnrollStudent(p_student_id IN VARCHAR2, p_course_id IN VARCHAR2, p_sec_id IN VARCHAR2, p_semester IN VARCHAR2, p_year IN NUMBER) IS
    BEGIN
        INSERT INTO Takes (ID, course_id, sec_id, semester, year, grade)
        VALUES (p_student_id, p_course_id, p_sec_id, p_semester, p_year, NULL);
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END EnrollStudent;

    -- Procedure to Drop a Course
    PROCEDURE DropCourse(p_student_id IN VARCHAR2, p_course_id IN VARCHAR2, p_sec_id IN VARCHAR2, p_semester IN VARCHAR2, p_year IN NUMBER) IS
        v_count NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_count FROM Takes 
        WHERE ID = p_student_id AND course_id = p_course_id 
          AND sec_id = p_sec_id AND semester = p_semester AND year = p_year;
          
        IF v_count = 0 THEN
            RAISE_APPLICATION_ERROR(-20004, 'Cannot drop this course as the student is not registered.');
        END IF;

        DELETE FROM Takes 
        WHERE ID = p_student_id AND course_id = p_course_id 
          AND sec_id = p_sec_id AND semester = p_semester AND year = p_year;
        COMMIT;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            RAISE;
    END DropCourse;

    -- Function to get a cursor of the student's academic history
    FUNCTION GetStudentHistory(p_student_id IN VARCHAR2) RETURN t_record_cursor IS
        v_cursor t_record_cursor;
    BEGIN
        OPEN v_cursor FOR
            SELECT c.course_id, c.title, t.semester, t.year, t.grade, c.credits
            FROM Takes t
            JOIN Course c ON t.course_id = c.course_id
            WHERE t.ID = p_student_id
            ORDER BY t.year DESC, CASE WHEN t.semester = 'Odd' THEN 1 ELSE 2 END;
        RETURN v_cursor;
    END GetStudentHistory;

    -- Function to get a cursor of available course sections in a term
    FUNCTION GetAvailableCourses(p_semester IN VARCHAR2, p_year IN NUMBER) RETURN t_record_cursor IS
        v_cursor t_record_cursor;
    BEGIN
        OPEN v_cursor FOR
            SELECT s.course_id, c.title, s.sec_id, i.name as instructor_name, s.capacity, s.enrolled, ts.day, ts.start_time, ts.end_time
            FROM Section s
            JOIN Course c ON s.course_id = c.course_id
            LEFT JOIN Instructor i ON s.instructor_id = i.ID
            LEFT JOIN Time_Slot ts ON s.time_slot_id = ts.time_slot_id
            WHERE s.semester = p_semester AND s.year = p_year;
        RETURN v_cursor;
    END GetAvailableCourses;

END pkg_registration;
/
