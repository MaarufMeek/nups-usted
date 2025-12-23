// src/components/admin/StudentDetailModal.tsx
import {useEffect, useState} from 'react';
import {X} from 'lucide-react';
import type {StudentProfile} from '../services/api.ts';

interface StudentDetailModalProps {
    student: StudentProfile;
    onClose: () => void;
}

const StudentDetailModal = ({student, onClose}: StudentDetailModalProps) => {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
    };

    // Wait for exit animation to finish before calling onClose
    useEffect(() => {
        if (isClosing) {
            const timer = setTimeout(() => {
                onClose();
            }, 300); // Matches animation duration below
            return () => clearTimeout(timer);
        }
    }, [isClosing, onClose]);

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
                isClosing ? 'backdrop-exit' : 'backdrop-enter'
            }`}
            onClick={handleClose}
        >
            {/* Blurred Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md"/>

            {/* Modal Card with Pop Animation */}
            <div
                className={`
          relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto
          ${isClosing ? 'modal-exit' : 'modal-enter'}
        `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sticky Header */}
                <div
                    className="sticky top-0 bg-white flex justify-between items-center p-6 border-b border-gray-200 rounded-t-xl z-10">
                    <h2 className="text-2xl font-bold text-blue-800">Student Profile</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6 text-gray-600"/>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Photo & Name Section */}
                    <div className="md:col-span-1 flex flex-col items-center">
                        {student.id_picture ? (
                            <img
                                src={student.id_picture as string}
                                alt={`${student.first_name} ${student.last_name}`}
                                className="w-48 h-48 object-cover rounded-full border-4 border-blue-200 shadow-xl"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                        ) : null}

                        {/* Fallback Avatar */}
                        {(!student.id_picture || student.id_picture === '') && (
                            <div
                                className="w-48 h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center border-4 border-blue-300 shadow-xl">
                <span className="text-6xl font-light text-blue-700">
                  {student.first_name?.[0]?.toUpperCase() || ''}{student.last_name?.[0]?.toUpperCase() || ''}
                </span>
                            </div>
                        )}

                        <h3 className="mt-6 text-2xl font-bold text-gray-800">
                            {student.first_name} {student.last_name}
                            {student.other_name && <span className="text-lg font-normal"> {student.other_name}</span>}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{student.email}</p>
                    </div>

                    {/* Details Section */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Personal Information */}
                        <section>
                            <h4 className="text-lg font-semibold text-blue-700 mb-4">Personal Information</h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="font-medium text-gray-600">Gender</dt>
                                    <dd className="mt-1">{student.gender || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-gray-600">Marital Status</dt>
                                    <dd className="mt-1">{student.marital_status || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-gray-600">Date of Birth</dt>
                                    <dd className="mt-1">
                                        {student.date_of_birth
                                            ? new Date(student.date_of_birth).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })
                                            : '—'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-gray-600">Contact Number</dt>
                                    <dd className="mt-1">{student.contact || '—'}</dd>
                                </div>
                            </dl>
                        </section>

                        {/* Academic Information */}
                        <section>
                            <h4 className="text-lg font-semibold text-blue-700 mb-4">Academic Information</h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <dt className="font-medium text-gray-600">Program of Study</dt>
                                    <dd className="mt-1">{student.program?.name || '—'}</dd>
                                </div>
                                <div>
                                    <dt className="font-medium text-gray-600">Hall of Affiliation</dt>
                                    <dd className="mt-1">{student.hall?.name || '—'}</dd>
                                </div>
                            </dl>
                        </section>

                        {/* Wings */}
                        {student.wings && student.wings.length > 0 && (
                            <section>
                                <h4 className="text-lg font-semibold text-blue-700 mb-4">Wings</h4>
                                <div className="flex flex-wrap gap-3">
                                    {student.wings.map((wing) => (
                                        <span
                                            key={wing.id}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                                        >
                      {wing.name}
                    </span>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Emergency Contact */}
                        <section>
                            <h4 className="text-lg font-semibold text-blue-700 mb-4">Emergency Contact</h4>
                            {student.emergency_contact ? (
                                <dl className="text-sm space-y-2 flex flex-row gap-16">
                                    <div>
                                        <dt className="font-medium text-gray-600">Name</dt>
                                        <dd className="mt-1">{student.emergency_contact.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="font-medium text-gray-600">Phone</dt>
                                        <dd className="mt-1">{student.emergency_contact.phone}</dd>
                                    </div>
                                </dl>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No emergency contact provided</p>
                            )}
                        </section>

                        {/* Residence */}
                        <section>
                            <h4 className="text-lg font-semibold text-blue-700 mb-4">Place of Residence</h4>
                            <p className="text-sm text-gray-700">
                                {student.place_of_residence || '—'}
                            </p>
                        </section>

                        {/* Joined Date */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                <span className="font-medium">Joined on:</span>{' '}
                                {student.created_at
                                    ? new Date(student.created_at).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })
                                    : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;