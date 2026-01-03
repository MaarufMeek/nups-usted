import {type ChangeEvent, type FormEvent, useCallback, useEffect, useState} from "react";
import {
    getHalls,
    getPrograms,
    getWings,
    type Hall,
    type Program,
    type StudentProfile,
    submitStudentProfile,
    type Wing,
} from "../services/api";
import {toast} from 'react-toastify';

export const useStudentForm = () => {
    // Form state
    const [formData, setFormData] = useState<Partial<StudentProfile>>({
        first_name: "",
        last_name: "",
        other_name: "",
        date_of_birth: "",
        gender: "Male",
        marital_status: "Single",
        contact: "",
        email: "",
        place_of_residence: "",
        program_id: 0,
        custom_program_name: "",
        hall_id: 0,
        wing_ids: [],
        emergency_contact_data: {
            name: "",
            phone: "",
        },
        id_picture: undefined,
    })

    // Dropdown data
    const [programs, setPrograms] = useState<Program[]>([])
    const [halls, setHalls] = useState<Hall[]>([])
    const [wings, setWings] = useState<Wing[]>([])

    // Ui State
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
    const [idPreview, setIdPreview] = useState<string | null>(null);


    // Load dropdown data on mount
    useEffect(() => {
        const loadDropdownData = async () => {
            setLoading(true);
            try {
                const [programsData, hallsData, wingsData] = await Promise.all([
                    getPrograms(),
                    getHalls(),
                    getWings(),
                ]);
                setPrograms(programsData)
                setHalls(hallsData);
                setWings(wingsData);
            } catch (err: any) {
                setError("Failed to load form options. Please refresh the page")
                console.error("Error loading dropdown", err)
            } finally {
                setLoading(false)
            }
        }
        loadDropdownData();
    }, []);

    // Handle input changes
    const handleChange = useCallback((
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;

        if (name === "contact") {
            // Only allow numbers
            const numericValue = value.replace(/\D/g, '');
            setFormData((prev) => ({
                ...prev,
                contact: numericValue,
            }));

            // Clear error if fixed
            if (validationErrors.contact) {
                setValidationErrors((prev) => {
                    const newErrors = {...prev};
                    delete newErrors.contact;
                    return newErrors;
                });
            }
            return; // Skip rest of logic for this field
        }

        if (name === "wing_ids") {
            // Handle checkbox for wings
            const checkboxElement = e.target as HTMLInputElement;
            const wingId = Number(checkboxElement.value);
            const isChecked = checkboxElement.checked;

            setFormData((prev) => {
                const currentWings = prev.wing_ids || [];
                if (isChecked) {
                    // Add wing if checked
                    return {
                        ...prev,
                        wing_ids: [...currentWings, wingId],
                    };
                } else {
                    // Remove wing if unchecked
                    return {
                        ...prev,
                        wing_ids: currentWings.filter((id) => id !== wingId),
                    };
                }
            });
        } else if (name.startsWith("emergency_contact_")) {
            // Handle emergency contact fields
            const field = name.replace("emergency_contact_", "")
            setFormData((prev) => ({
                ...prev,
                emergency_contact_data: {
                    ...prev.emergency_contact_data!,
                    [field]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
        // Clear validation errors when user types
        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }
    }, [validationErrors]);

    // Handle file input
    const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Update formData
            setFormData((prev) => ({
                ...prev,
                id_picture: file,
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, []);


    // Handle emergency contact name change
    const handleEmergencyNameChange = useCallback((value: string) => {
        setFormData((prev) => ({
            ...prev,
            emergency_contact_data: {
                name: value,
                phone: prev.emergency_contact_data?.phone || "",
            },
        }));
    }, []);

    // Handle emergency contact phone change
    const handleEmergencyPhoneChange = useCallback((value: string) => {
        const numericValue = value.replace(/\D/g, ''); // Only keep digits

        setFormData((prev) => ({
            ...prev,
            emergency_contact_data: {
                name: prev.emergency_contact_data?.name || "",
                phone: numericValue,
            },
        }));
    }, []);


    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };

            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d")!;

                // Max dimensions
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;

                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = (height * MAX_WIDTH) / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = (width * MAX_HEIGHT) / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            resolve(file); // fallback
                            return;
                        }
                        const compressedFile = new File([blob], file.name, {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    "image/jpeg",
                    0.8 // 80% quality
                );
            };

            reader.readAsDataURL(file);
        });
    };


    const validateAllFields = useCallback((data: Partial<StudentProfile> = formData): Record<string, string[]> => {
        const errors: Record<string, string[]> = {};

        // Personal Details
        if (!data.first_name?.trim()) errors.first_name = ["First name is required"];
        if (!data.last_name?.trim()) errors.last_name = ["Last name is required"];
        if (!data.date_of_birth) errors.date_of_birth = ["Date of birth is required"];

        // Contact
        if (!data.contact?.trim()) {
            errors.contact = ["Phone number is required"];
        } else if (!/^\d{10}$/.test(data.contact)) {
            errors.contact = ["Phone number must be exactly 10 digits"];
        }

        if (!data.email?.trim()) {
            errors.email = ["Email is required"];
        } else if (!/^\S+@\S+\.\S+$/.test(data.email)) {
            errors.email = ["Please enter a valid email address"];
        }

        if (!data.place_of_residence?.trim() || data.place_of_residence === "Outside Campus") {
            errors.place_of_residence = ["Please specify your place of residence"];
        }

        // Program
        const isOtherProgram = data.program_id === -1;
        if (!data.program_id || data.program_id === 0) {
            if (!data.custom_program_name?.trim()) {
                errors.program_id = ["Program of study is required"];
            }
        }
        if (isOtherProgram && !data.custom_program_name?.trim()) {
            errors.custom_program_name = ["Please specify your program name"];
        }

        // Hall
        if (!data.hall_id || data.hall_id === 0) {
            errors.hall_id = ["Hall of affiliation is required"];
        }

        if (!data.emergency_contact_data?.name?.trim()) {
            errors.emergency_name = ["Emergency contact name is required"];
        }

        // Emergency Phone (optional but must be valid if provided)
        const emergencyPhone = data.emergency_contact_data?.phone?.trim();
        if (emergencyPhone && !/^\d{10}$/.test(emergencyPhone)) {
            errors.emergency_phone = ["Emergency phone must be exactly 10 digits"];
        }


        if (!emergencyPhone) {
            errors.emergency_phone = ["Emergency contact phone number is required"];
        }

        // ID Picture
        if (!data.id_picture) {
            errors.id_picture = ["Profile picture is required"];
        } else if (!(data.id_picture instanceof File)) {
            errors.id_picture = ["Invalid image file"];
        } else {
            const file = data.id_picture;
            if (file.size > 10 * 1024 * 1024) {
                errors.id_picture = ["Image too large. Max 10MB allowed (will be compressed)"];
            }
            if (!/^image\/(jpeg|jpg|png|gif|webp)$/.test(file.type)) {
                errors.id_picture = ["Only JPG, PNG images allowed"];
            }
        }

        return errors;
    }, [formData]);

    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);
            setValidationErrors({});

            // Client-side validation
            const clientErrors = validateAllFields();
            if (Object.keys(clientErrors).length > 0) {
                setValidationErrors(clientErrors);
                toast.error("Please fix the errors below before submitting.", {autoClose: 2000});

                // Scroll to first error
                const firstErrorField = Object.keys(clientErrors)[0];
                const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
                if (element) {
                    element.scrollIntoView({behavior: "smooth", block: "center"});
                    element.focus();
                }

                setSubmitting(false);
                return;
            }

            try {
                let finalIdPicture = formData.id_picture as File;

                // Compress image if needed
                if (finalIdPicture.size > 2 * 1024 * 1024) { // Only compress if >2MB
                    toast.info("Compressing image for faster upload...", {autoClose: 3000});
                    finalIdPicture = await compressImage(finalIdPicture);
                }


                const studentData: StudentProfile = {
                    first_name: formData.first_name!.trim(),
                    last_name: formData.last_name!.trim(),
                    other_name: formData.other_name || "",
                    date_of_birth: formData.date_of_birth!,
                    gender: formData.gender || "Male",
                    marital_status: formData.marital_status || "Single",
                    contact: formData.contact!.trim(),
                    email: formData.email!.trim(),
                    place_of_residence: formData.place_of_residence!,

                    // program logic: if custom_program_name provided, set program_id undefined
                    program_id: formData.custom_program_name ? undefined : formData.program_id!,
                    custom_program_name: formData.custom_program_name || undefined,
                    hall_id: formData.hall_id!,
                    wing_ids: formData.wing_ids || [],
                    emergency_contact_data: {
                        name: formData.emergency_contact_data?.name || "",
                        phone: formData.emergency_contact_data?.phone || "",
                    },
                    id_picture: finalIdPicture,

                };

                await submitStudentProfile(studentData);

                toast.success("Profile submitted successfully! Thank you.", {
                    position: "top-right",
                    autoClose: 2000,
                });

                // Reset form
                setFormData({
                    first_name: "",
                    last_name: "",
                    other_name: "",
                    date_of_birth: "",
                    gender: "Male",
                    marital_status: "Single",
                    contact: "",
                    email: "",
                    place_of_residence: "",
                    program_id: 0,
                    custom_program_name: "",
                    hall_id: 0,
                    wing_ids: [],
                    emergency_contact_data: {name: "", phone: ""},
                    id_picture: undefined,
                });
                setIdPreview(null);

                const fileInput = document.getElementById("id_picture") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
            } catch (err: any) {
                // Your existing server error handling remains unchanged
                if (err.response?.data) {
                    // ... keep your existing parsing logic
                } else {
                    toast.error("Submission failed. Please try again.");
                }
            } finally {
                setSubmitting(false);
            }
        },
        [formData, validateAllFields]
    );

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({
            first_name: "",
            last_name: "",
            other_name: "",
            date_of_birth: "",
            gender: "Male",
            marital_status: "Single",
            contact: "",
            email: "",
            place_of_residence: "",
            program_id: 0,
            custom_program_name: "",
            hall_id: 0,
            wing_ids: [],
            emergency_contact_data: {
                name: "",
                phone: "",
            },
            id_picture: undefined,
        });
        setError(null);
        setValidationErrors({});
    }, []);


    return {
        // Form state
        formData,
        setFormData,

        // Dropdown data
        programs,
        halls,
        wings,

        // UI state
        loading,
        submitting,
        error,
        validationErrors,

        // Event handlers
        handleChange,
        handleFileChange,
        handleEmergencyNameChange,
        handleEmergencyPhoneChange,
        handleSubmit,
        resetForm,
        idPreview,
    };
};