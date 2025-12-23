/**
 * Example usage of the API service functions
 * 
 * This file shows how to use the API functions in your React components
 */

import {
  submitStudentProfile,
  getAllStudents,
  getStudentById,
  getPrograms,
  getHalls,
  getWings,
  type StudentProfile,
} from "./api";

// ============================================
// Example: Fetching Dropdown Data
// ============================================

export const loadDropdownData = async () => {
  try {
    // Fetch all dropdown options
    const [programs, halls, wings] = await Promise.all([
      getPrograms(),
      getHalls(),
      getWings(),
    ]);

    return { programs, halls, wings };
  } catch (error) {
    console.error("Error loading dropdown data:", error);
    throw error;
  }
};

// ============================================
// Example: Submitting Student Profile
// ============================================

export const handleSubmitProfile = async (formData: {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed";
  contact: string;
  placeOfResidence: string;
  programId: number;
  hallId: number;
  wingIds: number[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  profilePicture: File | null;
}) => {
  try {
    const studentData: StudentProfile = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      date_of_birth: formData.dateOfBirth, // Format: "YYYY-MM-DD"
      gender: formData.gender,
      marital_status: formData.maritalStatus,
      contact: formData.contact,
      place_of_residence: formData.placeOfResidence,
      program_id: formData.programId,
      hall_id: formData.hallId,
      wing_ids: formData.wingIds,
      emergency_contact_data: {
        name: formData.emergencyContactName,
        phone: formData.emergencyContactPhone,
      },
    };

    // Add profile picture if provided
    if (formData.profilePicture) {
      studentData.id_picture = formData.profilePicture;
    }

    const response = await submitStudentProfile(studentData);
    console.log("Profile submitted successfully:", response);
    return response;
  } catch (error: any) {
    // Handle validation errors
    if (error.response?.data) {
      console.error("Validation errors:", error.response.data);
      // error.response.data will contain field-specific errors
      // Example: { email: ["This field is required."], ... }
    }
    throw error;
  }
};

// ============================================
// Example: Admin - Get All Students
// ============================================

export const loadAllStudents = async () => {
  try {
    const students = await getAllStudents();
    console.log("Total students:", students.length);
    return students;
  } catch (error) {
    console.error("Error loading students:", error);
    throw error;
  }
};

// ============================================
// Example: Admin - Get Single Student
// ============================================

export const loadStudentDetails = async (studentId: number) => {
  try {
    const student = await getStudentById(studentId);
    console.log("Student details:", student);
    return student;
  } catch (error) {
    console.error("Error loading student:", error);
    throw error;
  }
};

