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
 * Compress image file to reduce upload size (especially important for mobile)
 */
const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Image compression failed'));
                            return;
                        }
                        // Create a new File object with the compressed blob
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    file.type,
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

/**
 * Submit a new student profile
 */
export const submitStudentProfile = async (
    data: StudentProfile
): Promise<StudentProfile> => {
    // Compress image if provided (reduces upload time, especially on mobile)
    let imageFile = data.id_picture;
    if (imageFile instanceof File) {
        try {
            // Only compress if file is larger than 500KB
            if (imageFile.size > 500 * 1024) {
                console.log(`Compressing image from ${(imageFile.size / 1024).toFixed(2)}KB...`);
                imageFile = await compressImage(imageFile);
                console.log(`Compressed to ${(imageFile.size / 1024).toFixed(2)}KB`);
            }
        } catch (error) {
            console.warn('Image compression failed, using original:', error);
            // Continue with original file if compression fails
        }
    }

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

    // Add image file (if provided) - use compressed version if available
    if (imageFile instanceof File) {
        formData.append("id_picture", imageFile);
    }

    const response: AxiosResponse<StudentProfile> = await api.post(
        "/students/",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            timeout: 120000, // 120 seconds (2 minutes) for file uploads - especially important on mobile
            // Enable upload progress tracking
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    console.log(`Upload progress: ${percentCompleted}%`);
                }
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

