-- ==============================================================================
-- Phase 1: Database Schema & DDL Scripts
-- University Course Registration System
-- ==============================================================================

SET DEFINE OFF;

-- Drop existing tables if they exist
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Takes CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Section CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Time_Slot CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Prereq CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Course CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Student CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Instructor CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Branch CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE Department CASCADE CONSTRAINTS';
EXCEPTION WHEN OTHERS THEN NULL; END;
/

-- 1. Department Table (Now represents the 'Stream')
CREATE TABLE Department (
    dept_name VARCHAR2(100) PRIMARY KEY,
    building VARCHAR2(50),
    budget NUMBER(12,2) CHECK (budget > 0)
);

-- 1.5 Branch Table (Sub-divisions of a Stream)
CREATE TABLE Branch (
    branch_name VARCHAR2(150) PRIMARY KEY,
    dept_name VARCHAR2(100) REFERENCES Department(dept_name) ON DELETE CASCADE
);

-- 2. Instructor Table
CREATE TABLE Instructor (
    ID VARCHAR2(10) PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    dept_name VARCHAR2(100) REFERENCES Department(dept_name) ON DELETE SET NULL,
    salary NUMBER(10,2) CHECK (salary >= 29000)
);

-- 3. Student Table (Students belong to a Branch)
CREATE TABLE Student (
    ID VARCHAR2(10) PRIMARY KEY,
    name VARCHAR2(50) NOT NULL,
    branch_name VARCHAR2(150) REFERENCES Branch(branch_name) ON DELETE SET NULL,
    tot_cred NUMBER(4) DEFAULT 0 CHECK (tot_cred >= 0),
    current_semester NUMBER(1) CHECK (current_semester BETWEEN 1 AND 8)
);

-- 4. Course Table (Courses are offered by a Department/Stream)
CREATE TABLE Course (
    course_id VARCHAR2(10) PRIMARY KEY,
    title VARCHAR2(100) NOT NULL,
    dept_name VARCHAR2(100) REFERENCES Department(dept_name) ON DELETE SET NULL,
    credits NUMBER(2) CHECK (credits > 0)
);

-- 5. Prereq Table (Prerequisites for courses)
CREATE TABLE Prereq (
    course_id VARCHAR2(10) REFERENCES Course(course_id) ON DELETE CASCADE,
    prereq_id VARCHAR2(10) REFERENCES Course(course_id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, prereq_id)
);

-- 6. Time_Slot Table 
CREATE TABLE Time_Slot (
    time_slot_id VARCHAR2(10),
    day VARCHAR2(20),
    start_time VARCHAR2(10),
    end_time VARCHAR2(10),
    PRIMARY KEY (time_slot_id, day, start_time)
);

-- 7. Section Table (Includes capacity to check seat limits)
CREATE TABLE Section (
    course_id VARCHAR2(10) REFERENCES Course(course_id) ON DELETE CASCADE,
    sec_id VARCHAR2(10),
    semester VARCHAR2(10) CHECK (semester IN ('Odd', 'Even')),
    year NUMBER(4) CHECK (year > 2000),
    instructor_id VARCHAR2(10) REFERENCES Instructor(ID) ON DELETE SET NULL,
    time_slot_id VARCHAR2(10),
    capacity NUMBER(3) DEFAULT 60 CHECK (capacity > 0),
    enrolled NUMBER(3) DEFAULT 0 CHECK (enrolled >= 0),
    PRIMARY KEY (course_id, sec_id, semester, year)
);

-- 8. Takes Table (Course Registration)
CREATE TABLE Takes (
    ID VARCHAR2(10) REFERENCES Student(ID) ON DELETE CASCADE,
    course_id VARCHAR2(10),
    sec_id VARCHAR2(10),
    semester VARCHAR2(10),
    year NUMBER(4),
    grade VARCHAR2(2),
    PRIMARY KEY (ID, course_id, sec_id, semester, year),
    FOREIGN KEY (course_id, sec_id, semester, year) REFERENCES Section(course_id, sec_id, semester, year) ON DELETE CASCADE
);

-- Initial Mock Data Ensure ALL branches have at least 1 student

-- 1. Insert Departments (Streams)
INSERT INTO Department VALUES ('Chemical', 'Chemical Block', 1500000);
INSERT INTO Department VALUES ('Civil', 'Civil Block', 1200000);
INSERT INTO Department VALUES ('Computer Science', 'Tech Building', 4000000);
INSERT INTO Department VALUES ('Information & Communication', 'ICT Building', 2500000);
INSERT INTO Department VALUES ('Electrical & Electronics', 'Elec Building', 3000000);
INSERT INTO Department VALUES ('Mechanical', 'Mech Building', 2500000);
INSERT INTO Department VALUES ('Mechatronics', 'Mech Building', 1500000);

-- 2. Insert Branches
-- Chemical Stream
INSERT INTO Branch VALUES ('B.Tech Biotechnology', 'Chemical');
INSERT INTO Branch VALUES ('B.Tech Chemical Engg', 'Chemical');

-- Civil Stream
INSERT INTO Branch VALUES ('B.Tech Civil Engg', 'Civil');
INSERT INTO Branch VALUES ('B.Tech Civil Engineering (Dual Degree Program with Macquarie University)', 'Civil');

-- Computer Science (CSE) Stream
INSERT INTO Branch VALUES ('B.Tech Computer Science & Engg', 'Computer Science');
INSERT INTO Branch VALUES ('B.Tech Computer Science & Engg (Artificial Intelligence & Machine Learning)', 'Computer Science');
INSERT INTO Branch VALUES ('B.Tech Data Science & Engg', 'Computer Science');
INSERT INTO Branch VALUES ('B.Tech in Computer Science and Financial Technology', 'Computer Science');
INSERT INTO Branch VALUES ('B.Tech in Mathematics and Computing', 'Computer Science');

-- Information & Communication (ICT) Stream
INSERT INTO Branch VALUES ('B.Tech Information Technology', 'Information & Communication');
INSERT INTO Branch VALUES ('B.Tech Computer & Communication Engg', 'Information & Communication');

-- Electrical & Electronics Stream
INSERT INTO Branch VALUES ('B.Tech Biomedical Engg', 'Electrical & Electronics');
INSERT INTO Branch VALUES ('B.Tech Cyber Physical Systems', 'Electrical & Electronics');
INSERT INTO Branch VALUES ('B.Tech Electrical & Electronics Engg', 'Electrical & Electronics');
INSERT INTO Branch VALUES ('B.Tech Electronics & Communication Engg', 'Electrical & Electronics');
INSERT INTO Branch VALUES ('B.Tech Electronics & Instrumentation Engg', 'Electrical & Electronics');
INSERT INTO Branch VALUES ('B.Tech Electronics Engineering (VLSI Design and Technology)', 'Electrical & Electronics');
INSERT INTO Branch VALUES ('B.Tech Electrical & Electronics Engineering (Dual Degree Program with Macquarie University)', 'Electrical & Electronics');

-- Mechanical Stream
INSERT INTO Branch VALUES ('B.Tech Aeronautical Engg', 'Mechanical');
INSERT INTO Branch VALUES ('B.Tech Automobile Engg', 'Mechanical');
INSERT INTO Branch VALUES ('B.Tech Industrial Engg', 'Mechanical');
INSERT INTO Branch VALUES ('B.Tech Mechanical Engg', 'Mechanical');
INSERT INTO Branch VALUES ('B.Tech Mechanical Engg (Dual Degree Program with Deakin University)', 'Mechanical');

-- Mechatronics Stream
INSERT INTO Branch VALUES ('B.Tech Mechatronics', 'Mechatronics');
INSERT INTO Branch VALUES ('B.Tech Mechatronics (Dual Degree Program with Deakin University)', 'Mechatronics');

-- 3. Insert Students (One for every single branch)
-- Chemical
INSERT INTO Student VALUES ('S001', 'Alice', 'B.Tech Biotechnology', 0);
INSERT INTO Student VALUES ('S002', 'Bob', 'B.Tech Chemical Engg', 0);

-- Civil
INSERT INTO Student VALUES ('S003', 'Charlie', 'B.Tech Civil Engg', 0);
INSERT INTO Student VALUES ('S004', 'David', 'B.Tech Civil Engineering (Dual Degree Program with Macquarie University)', 0);

-- Computer Science (CSE)
INSERT INTO Student VALUES ('S005', 'Anirudh', 'B.Tech Computer Science & Engg', 0);
INSERT INTO Student VALUES ('S006', 'Frank', 'B.Tech Computer Science & Engg (Artificial Intelligence & Machine Learning)', 0);
INSERT INTO Student VALUES ('S007', 'Grace', 'B.Tech Data Science & Engg', 0);
INSERT INTO Student VALUES ('S008', 'Heidi', 'B.Tech in Computer Science and Financial Technology', 0);
INSERT INTO Student VALUES ('S009', 'Akshith', 'B.Tech in Mathematics and Computing', 0);

-- Information & Communication (ICT)
INSERT INTO Student VALUES ('S010', 'Ivan', 'B.Tech Information Technology', 0);
INSERT INTO Student VALUES ('S011', 'Judy', 'B.Tech Computer & Communication Engg', 0);

-- Electrical & Electronics
INSERT INTO Student VALUES ('S012', 'Mallory', 'B.Tech Biomedical Engg', 0);
INSERT INTO Student VALUES ('S013', 'Niaj', 'B.Tech Cyber Physical Systems', 0);
INSERT INTO Student VALUES ('S014', 'Oscar', 'B.Tech Electrical & Electronics Engg', 0);
INSERT INTO Student VALUES ('S015', 'Akshay', 'B.Tech Electronics & Communication Engg', 0);
INSERT INTO Student VALUES ('S016', 'Peggy', 'B.Tech Electronics & Instrumentation Engg', 0);
INSERT INTO Student VALUES ('S017', 'Rupert', 'B.Tech Electronics Engineering (VLSI Design and Technology)', 0);
INSERT INTO Student VALUES ('S018', 'Sybil', 'B.Tech Electrical & Electronics Engineering (Dual Degree Program with Macquarie University)', 0);

-- Mechanical
INSERT INTO Student VALUES ('S019', 'Trent', 'B.Tech Aeronautical Engg', 0);
INSERT INTO Student VALUES ('S020', 'Victor', 'B.Tech Automobile Engg', 0);
INSERT INTO Student VALUES ('S021', 'Walter', 'B.Tech Industrial Engg', 0);
INSERT INTO Student VALUES ('S022', 'Xavier', 'B.Tech Mechanical Engg', 0);
INSERT INTO Student VALUES ('S023', 'Yasmine', 'B.Tech Mechanical Engg (Dual Degree Program with Deakin University)', 0);

-- Mechatronics
INSERT INTO Student VALUES ('S024', 'Zane', 'B.Tech Mechatronics', 0);
INSERT INTO Student VALUES ('S025', 'Arthur', 'B.Tech Mechatronics (Dual Degree Program with Deakin University)', 0);


-- 4. Insert Instructors
INSERT INTO Instructor VALUES ('101', 'Prof. Smith', 'Computer Science', 85000);
INSERT INTO Instructor VALUES ('102', 'Prof. Taylor', 'Electrical & Electronics', 82000);
INSERT INTO Instructor VALUES ('103', 'Prof. Davis', 'Mechanical', 80000);
INSERT INTO Instructor VALUES ('104', 'Prof. Lee', 'Information & Communication', 84000);

-- 5. Insert Courses
INSERT INTO Course VALUES ('CS101', 'Intro to Computer Science', 'Computer Science', 4);
INSERT INTO Course VALUES ('CS201', 'Database Systems', 'Computer Science', 3);
INSERT INTO Course VALUES ('EC101', 'Digital Electronics', 'Electrical & Electronics', 4);
INSERT INTO Course VALUES ('ME101', 'Engineering Mechanics', 'Mechanical', 3);
INSERT INTO Course VALUES ('IT101', 'Web Technologies', 'Information & Communication', 3);

-- Staple Even Courses
INSERT INTO Course VALUES ('CS202', 'Data Structures and Algorithms', 'Computer Science', 4);
INSERT INTO Course VALUES ('ME202', 'Thermodynamics', 'Mechanical', 3);
INSERT INTO Course VALUES ('EE202', 'Signals and Systems', 'Electrical & Electronics', 4);
INSERT INTO Course VALUES ('IT202', 'Computer Networks', 'Information & Communication', 3);

-- 6. Insert Prerequisites
INSERT INTO Prereq VALUES ('CS201', 'CS101');

-- 7. Insert Time Slots
INSERT INTO Time_Slot VALUES ('T1', 'Monday', '10:00', '11:00');
INSERT INTO Time_Slot VALUES ('T2', 'Tuesday', '14:00', '15:00');
INSERT INTO Time_Slot VALUES ('T3', 'Wednesday', '09:00', '10:00');

-- 8. Insert Sections
INSERT INTO Section VALUES ('CS101', '1', 'Odd', 2026, '101', 'T1', 60, 0);
INSERT INTO Section VALUES ('CS201', '1', 'Odd', 2026, '101', 'T2', 30, 0);
INSERT INTO Section VALUES ('EC101', '1', 'Odd', 2026, '102', 'T1', 40, 0);
INSERT INTO Section VALUES ('ME101', '1', 'Odd', 2026, '103', 'T3', 50, 0);
INSERT INTO Section VALUES ('IT101', '1', 'Odd', 2026, '104', 'T2', 40, 0);

-- Staple Even Sections
INSERT INTO Section VALUES ('CS202', '1', 'Even', 2026, '101', 'T1', 60, 0);
INSERT INTO Section VALUES ('ME202', '1', 'Even', 2026, '103', 'T2', 50, 0);
INSERT INTO Section VALUES ('EE202', '1', 'Even', 2026, '102', 'T3', 40, 0);
INSERT INTO Section VALUES ('IT202', '1', 'Even', 2026, '104', 'T1', 50, 0);

-- Semester Default Update
UPDATE Student SET current_semester = 5;

COMMIT;