package com.university.models;

public class Student {
    private String id;
    private String name;
    private String branchName;
    private int totCred;
    private int currentSemester;

    public Student(String id, String name, String branchName, int totCred, int currentSemester) {
        this.id = id;
        this.name = name;
        this.branchName = branchName;
        this.totCred = totCred;
        this.currentSemester = currentSemester;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getBranchName() { return branchName; }
    public int getTotCred() { return totCred; }
    public int getCurrentSemester() { return currentSemester; }
}
