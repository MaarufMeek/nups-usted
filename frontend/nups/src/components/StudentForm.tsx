import {type ChangeEvent} from "react";
import sitelogo from "../assets/sitelogo.png";
import {useStudentForm} from "../hooks/useForm.ts";


const StudentForm = () => {
    const {
        formData,
        programs,
        halls,
        wings,
        loading,
        submitting,
        error,
        validationErrors,
        handleChange,
        handleFileChange,
        handleEmergencyNameChange,
        handleEmergencyPhoneChange,
        handleSubmit,
        idPreview
    } = useStudentForm();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-blue-50">
                <p className="text-blue-600 text-sm">Loading form...</p>
            </div>
        );
    }

    return (
        <>
            <nav
                className="bg-blue-600 flex px-4 py-1 flex-col fixed w-full md:flex-row md:justify-between md:items-center items-center gap-3">
                <img src={sitelogo} alt="nups-logo" className="h-auto"/>
                <p className="text-[#FFDA04] font-bold text-xl">
                    <span
                        className="text-[#A61343]"
                        style={{WebkitTextStroke: "0.5px #FFDA04"}}
                    >
                        AAMUSTED
                    </span>
                    -Local
                </p>
            </nav>
            <div className="min-h-screen pb-12 pt-2 px-4 bg-blue-50/30">
                <div className="max-w-4xl mx-auto mt-30 md:mt-20  bg-blue-50/90 rounded-lg p-4">
                    <div className="mb-4">
                        <h1 className="text-2xl font-semibold text-blue-700 mb-2 text-center">
                            Member Profile Submission
                        </h1>
                        <p className="text-sm text-gray-600 text-center">
                            Please fill in all required fields to complete your profile
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-r">
                            <div className="flex items-start">
                                <span className="mr-2">⚠️</span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/*{success && (*/}
                    {/*    <div*/}
                    {/*        className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 text-green-700 text-sm rounded-r">*/}
                    {/*        <div className="flex items-start">*/}
                    {/*            <span className="mr-2">✓</span>*/}
                    {/*            <span>Profile submitted successfully! Thank you for your submission.</span>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Details Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="h-px flex-1 bg-blue-100"></div>
                                <h2 className="text-base font-semibold text-blue-700 px-3">
                                    Personal Details
                                </h2>
                                <div className="h-px flex-1 bg-blue-100"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your first name"
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    />
                                    {validationErrors.first_name && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {validationErrors.first_name[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your last name"
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    />
                                    {validationErrors.last_name && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {validationErrors.last_name[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Other Name
                                    </label>
                                    <input
                                        type="text"
                                        name="other_name"
                                        value={formData.other_name}
                                        onChange={handleChange}
                                        placeholder="Optional middle name"
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date of Birth <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    />
                                    {validationErrors.date_of_birth && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {validationErrors.date_of_birth[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Gender <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Marital Status <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="marital_status"
                                        value={formData.marital_status}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    >
                                        <option value="Single">Single</option>
                                        <option value="Married">Married</option>
                                        <option value="Divorced">Divorced</option>
                                        <option value="Widowed">Widowed</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* Contact Information Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="h-px flex-1 bg-blue-100"></div>
                                <h2 className="text-base font-semibold text-blue-700 px-3">
                                    Contact Information
                                </h2>
                                <div className="h-px flex-1 bg-blue-100"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        required
                                        maxLength={10}
                                        placeholder="e.g., 0244123456"
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    />
                                    {validationErrors.contact && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {validationErrors.contact[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g., student@example.com"
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    />
                                    {validationErrors.email && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {validationErrors.email[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Place of Residence <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="place_of_residence"
                                        value={formData.place_of_residence}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your residential address"
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    />
                                    {validationErrors.place_of_residence && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {validationErrors.place_of_residence[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Education Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="h-px flex-1 bg-blue-100"></div>
                                <h2 className="text-base font-semibold text-blue-700 px-3">
                                    Education & Affiliation
                                </h2>
                                <div className="h-px flex-1 bg-blue-100"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Program of Study <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="program_id"
                                        value={formData.program_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    >
                                        <option value={0}>Select Program</option>
                                        {programs.map((program) => (
                                            <option key={program.id} value={program.id}>
                                                {program.name}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.program_id && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {validationErrors.program_id[0]}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hall of Affiliation <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="hall_id"
                                        value={formData.hall_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    >
                                        <option value={0}>Select Hall</option>
                                        {halls.map((hall) => (
                                            <option key={hall.id} value={hall.id}>
                                                {hall.name}
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.hall_id && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {validationErrors.hall_id[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Wings of Choice (Select multiple)
                                    </label>
                                    <div
                                        className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border border-blue-200 rounded bg-blue-50/30">
                                        {wings.map((wing) => (
                                            <label
                                                key={wing.id}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-blue-100/50 p-2 rounded transition-colors duration-150 ease-in-out"
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="wing_ids"
                                                    value={wing.id}
                                                    checked={formData.wing_ids?.includes(wing.id) || false}
                                                    onChange={handleChange}
                                                    className="w-4 h-4 text-blue-600 border-blue-400 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                                />
                                                <span className="text-sm text-gray-700">{wing.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Emergency Contact Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="h-px flex-1 bg-blue-100"></div>
                                <h2 className="text-base font-semibold text-blue-700 px-3">
                                    Emergency Contact
                                </h2>
                                <div className="h-px flex-1 bg-blue-100"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.emergency_contact_data?.name || ""}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleEmergencyNameChange(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={formData.emergency_contact_data?.phone || ""}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleEmergencyPhoneChange(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-blue-400 rounded text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 transition-all duration-150 ease-in-out placeholder:text-gray-400"
                                    />
                                    {validationErrors.emergency_phone && (
                                        <p className="text-red-600 text-xs mt-1">
                                            {validationErrors.emergency_phone[0]}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Profile Picture Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="h-px flex-1 bg-blue-100"></div>
                                <h2 className="text-base font-semibold text-blue-700 px-3">
                                    Profile Picture
                                </h2>
                                <div className="h-px flex-1 bg-blue-100"></div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-700 mb-1">
                                    ID Picture
                                </label>

                                <div
                                    className="relative w-full min-h-[10rem] border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center overflow-hidden hover:border-blue-600 transition">
                                    {idPreview ? (
                                        <img
                                            src={idPreview}
                                            alt="ID preview"
                                            className="w-auto h-[9rem] rounded-lg"
                                        />
                                    ) : (
                                        <span className="text-8xl text-blue-400 font-light pointer-events-none">+</span>
                                    )}

                                    <input
                                        type="file"
                                        id="id_picture"
                                        name="id_picture"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>


                                {validationErrors.id_picture && (
                                    <p className="text-red-600 text-xs mt-1">
                                        {validationErrors.id_picture[0]}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded text-sm font-semibold hover:bg-blue-700 focus:outline-none focus:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 ease-in-out uppercase tracking-wide"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                    <span
                                        className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Submitting...
                                  </span>
                                ) : (
                                    "Submit Profile"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default StudentForm;