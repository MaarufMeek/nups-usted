import api from "../apiConfig";
import type {AxiosResponse} from "axios";

// ============================================
// Type Definitions
// ============================================

export interface Program {
    id: number;
    name: string;
}

export interface Hall {
    id: number;
    name: string;
}

export interface Wing {
    id: number;
    name: string;
}

export interface EmergencyContact {
    name: string;
    phone: string;
}

export interface StudentProfile {
    id?: number;
    first_name: string;
    last_name: string;
    other_name?: string;
    date_of_birth: string; // Format: YYYY-MM-DD
    gender: "Male" | "Female";
    marital_status: "Single" | "Married" | "Divorced" | "Widowed";
    contact: string;
    email: string;
    place_of_residence: string;
    program_id: number;
    hall_id: number;
    wing_ids?: number[];
    emergency_contact_data?: EmergencyContact;
    id_picture?: File | string;
    // Read-only fields (returned from API)
    program?: Program;
    hall?: Hall;
    wings?: Wing[];
    emergency_contact?: EmergencyContact;
    created_at?: string;
}

// ============================================
// API Service Functions
// ============================================

/**
 * Submit a new student profile
 */
export const submitStudentProfile = async (
    data: StudentProfile
): Promise<StudentProfile> => {
    // Create FormData for file upload
    const formData = new FormData();

    // Add all fields to FormData
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    if (data.other_name) {
        formData.append("other_name", data.other_name);
    }
    formData.append("date_of_birth", data.date_of_birth);
    formData.append("gender", data.gender);
    formData.append("marital_status", data.marital_status);
    formData.append("contact", data.contact);
    formData.append("email", data.email);
    formData.append("place_of_residence", data.place_of_residence);
    formData.append("program_id", data.program_id.toString());
    formData.append("hall_id", data.hall_id.toString());

    // Add wings (if provided)
    if (data.wing_ids && data.wing_ids.length > 0) {
        data.wing_ids.forEach((wingId) => {
            formData.append("wing_ids", wingId.toString());
        });
    }

    // Add emergency contact (if provided)
    if (data.emergency_contact_data) {
        formData.append("emergency_contact_data.name", data.emergency_contact_data.name || "");
        formData.append("emergency_contact_data.phone", data.emergency_contact_data.phone || "");
    }

    // Add image file (if provided)
    if (data.id_picture instanceof File) {
        formData.append("id_picture", data.id_picture);
    }

    const response: AxiosResponse<StudentProfile> = await api.post(
        "/students/",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

/**
 * Get all student profiles (Admin endpoint)
 */
export const getAllStudents = async (): Promise<StudentProfile[]> => {
    const response: AxiosResponse<StudentProfile[]> = await api.get("/students/");
    return response.data;
};

/**
 * Get a single student profile by ID (Admin endpoint)
 */
export const getStudentById = async (id: number): Promise<StudentProfile> => {
    const response: AxiosResponse<StudentProfile> = await api.get(
        `/students/${id}/`
    );
    return response.data;
};

/**
 * Get all programs (for dropdown)
 */
export const getPrograms = async (): Promise<Program[]> => {
    const response: AxiosResponse<Program[]> = await api.get("/programs/");
    return response.data;
};

/**
 * Get all halls (for dropdown)
 */
export const getHalls = async (): Promise<Hall[]> => {
    const response: AxiosResponse<Hall[]> = await api.get("/halls/");
    return response.data;
};

/**
 * Get all wings (for dropdown)
 */
export const getWings = async (): Promise<Wing[]> => {
    const response: AxiosResponse<Wing[]> = await api.get("/wings/");
    return response.data;
};

