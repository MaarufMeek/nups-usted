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

    // Handle form submission
    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setSubmitting(true);
            setError(null);
            setValidationErrors({});

            // Validate main phone
            if (!isValidPhone(formData.contact || "")) {
                setValidationErrors((prev) => ({
                    ...prev,
                    contact: ["Phone number must be exactly 10 digits"],
                }));
                setError("Please correct the errors below.");
                setSubmitting(false);
                return;
            }

            // Validate emergency phone (optional but recommended)
            const emergencyPhone = formData.emergency_contact_data?.phone || "";
            if (emergencyPhone && !isValidPhone(emergencyPhone)) {
                setValidationErrors((prev) => ({
                    ...prev,
                    emergency_phone: ["Emergency phone must be exactly 10 digits"], // custom key
                }));
                setError("Please correct the errors below.");
                setSubmitting(false);
                return;
            }

            try {
                // Validate required fields
                if (!formData.first_name || !formData.last_name || !formData.email) {
                    setError("Please fill in all required fields.");
                    setSubmitting(false);
                    return;
                }

                const studentData: StudentProfile = {
                    first_name: formData.first_name!,
                    last_name: formData.last_name!,
                    other_name: formData.other_name || undefined,
                    date_of_birth: formData.date_of_birth!,
                    gender: formData.gender!,
                    marital_status: formData.marital_status!,
                    contact: formData.contact!,
                    email: formData.email!,
                    place_of_residence: formData.place_of_residence!,
                    program_id: formData.custom_program_name ? undefined : formData.program_id!,
                    custom_program_name: formData.custom_program_name || undefined,
                    hall_id: formData.hall_id!,
                    wing_ids: formData.wing_ids || [],
                    emergency_contact_data: formData.emergency_contact_data,
                    id_picture: formData.id_picture,
                };
                await submitStudentProfile(studentData);


                toast.success("Profile submitted successfully! Thank you for your submission.", {
                    position: "top-right",
                    autoClose: 5000,
                });

                // Reset form (keep this)
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
                setIdPreview(null); // Also clear preview

                // Clear file input
                const fileInput = document.getElementById("id_picture") as HTMLInputElement;
                if (fileInput) fileInput.value = "";
            } catch (err: any) {
                if (err.response?.data) {
                    const errorData = err.response.data;
                    let parsedErrors: Record<string, string[]> = {};

                    // Check if error is a stringified Python dict (from Django)
                    if (errorData.error && typeof errorData.error === 'string') {
                        try {
                            // The error string is in Python dict format
                            // Example: "{'email': [ErrorDetail(string='student profile with this email already exists.', code='unique')]}"
                            const errorString = errorData.error;
                            
                            // Use regex to extract field names and ErrorDetail messages
                            // Pattern: 'field_name': [ErrorDetail(string='message', code='code')]
                            const fieldPattern = /'(\w+)':\s*\[ErrorDetail\(string='([^']+)',\s*code='[^']+'\)\]/g;
                            let match;
                            
                            while ((match = fieldPattern.exec(errorString)) !== null) {
                                const fieldName = match[1];
                                const errorMessage = match[2];
                                parsedErrors[fieldName] = [errorMessage];
                            }
                            
                            // If no matches found, try alternative pattern (without ErrorDetail wrapper)
                            if (Object.keys(parsedErrors).length === 0) {
                                // Try simpler pattern: 'field': ['message']
                                const simplePattern = /'(\w+)':\s*\[['"]([^'"]+)['"]\]/g;
                                while ((match = simplePattern.exec(errorString)) !== null) {
                                    parsedErrors[match[1]] = [match[2]];
                                }
                            }
                        } catch (parseError) {
                            console.error('Error parsing validation errors:', parseError, errorData.error);
                        }
                    } else if (typeof errorData === 'object' && !errorData.error) {
                        // Direct validation errors object (normal case)
                        parsedErrors = errorData;
                    }

                    if (Object.keys(parsedErrors).length > 0) {
                        setValidationErrors(parsedErrors);
                        toast.error("Please correct the highlighted errors.", {
                            autoClose: 6000,
                        });
                    } else {
                        // Show general error message
                        const errorMessage = errorData.detail || errorData.error || "Failed to submit form. Please try again.";
                        setError(errorMessage);
                        toast.error(errorMessage);
                    }
                } else {
                    toast.error(err.message || "Failed to submit form. Please try again.");
                }
            } finally {
                setSubmitting(false);
            }
        }, [formData]);

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

    const isValidPhone = (phone: string): boolean => {
        const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
        return cleaned.length === 10 && /^\d{10}$/.test(cleaned);
    };

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