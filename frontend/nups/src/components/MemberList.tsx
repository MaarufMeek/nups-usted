// src/components/admin/MembersList.tsx
import {useMemo, useState} from 'react';
import type {StudentProfile} from '../services/api.ts';
import {useStudents} from '../hooks/useStudents.ts';
import {Download, Eye} from 'lucide-react';
import StudentDetailModal from './StudentDetailModal.tsx';
import {jsPDF} from 'jspdf';
import autoTable from 'jspdf-autotable';

const MembersList = () => {
    const {data: studentsData = [], isLoading: loading} = useStudents();
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
    const [genderFilter, setGenderFilter] = useState<string>("")
    const [hallFilter, setHallFilter] = useState<string>("")
    const [programFilter, setProgramFilter] = useState<string>("")

    // Memoize filtered students for performance
    const students = useMemo(() => {
        return studentsData.filter((student) => {
            const genderMatch = !genderFilter || student.gender === genderFilter;
            const hallMatch = !hallFilter || student.hall?.name === hallFilter;
            const programMatch = !programFilter || student.program?.name === programFilter;
            return genderMatch && hallMatch && programMatch;
        });
    }, [studentsData, genderFilter, hallFilter, programFilter]);


    const exportToPDF = () => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        // Title
        doc.setFontSize(20);
        doc.text('All Registered Members - Full Details', 14, 20);

        // Subtitle
        doc.setFontSize(12);
        doc.text(`Total Members: ${students.length}`, 14, 30);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })}`, 14, 37);

        const tableColumns = [
            'Name',
            'Gender',
            'Contact',
            'Residence',
            'Program',
            'Hall',
            'Wings',
        ];

        const tableRows = students.map((s) => [
            `${s.first_name} ${s.other_name || ""} ${s.last_name}`,
            s.gender || '—',
            s.contact || '—',
            s.place_of_residence || '—',
            s.program?.name || '—',
            s.hall?.name || '—',
            s.wings && s.wings.length > 0 ? s.wings.map((w) => w.name).join(', ') : '—',

        ]);

        // Use the imported autoTable function
        autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: {fontSize: 8, cellPadding: 3, overflow: 'linebreak', valign: 'middle'},
            headStyles: {fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', halign: 'center'},
            alternateRowStyles: {fillColor: [245, 249, 255]},
            columnStyles: {
                0: {fontStyle: 'bold'},
                10: {cellWidth: 40},
                11: {cellWidth: 35},
                12: {cellWidth: 30},
            },
            margin: {top: 45, left: 10, right: 10},
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
        });

        doc.save(`full-members-list-${new Date().toISOString().split('T')[0]}.pdf`);
    };
    if (loading) return <p className="text-center py-10">Loading members...</p>;

    return (
        <div>
            <div className="mt-8 mb-6">
                    <div className="flex flex-row sm:flex-row sm:flex-wrap gap-3">
                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            className="w-full sm:w-auto border border-blue-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>

                        <select
                            value={programFilter}
                            onChange={(e) => setProgramFilter(e.target.value)}
                            className="w-full sm:w-auto border border-blue-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">All Programs</option>
                            {[...new Set(studentsData.map(s => s.program?.name).filter(Boolean))].map(
                                (program) => (
                                    <option key={program} value={program}>
                                        {program}
                                    </option>
                                )
                            )}
                        </select>

                        <select
                            value={hallFilter}
                            onChange={(e) => setHallFilter(e.target.value)}
                            className="w-full sm:w-auto border border-blue-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">All Halls</option>
                            {[...new Set(studentsData.map(s => s.hall?.name).filter(Boolean))].map(
                                (hall) => (
                                    <option key={hall} value={hall}>
                                        {hall}
                                    </option>
                                )
                            )}
                        </select>
                </div>
            </div>


            {/* Header with Export Button */}
            <div className="flex flex-row sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h1 className="text-xl md:text-2xl font-bold text-blue-800">
                    Total Members ({students.length})
                </h1>

                <button
                    onClick={exportToPDF}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
                >
                    <Download className="w-5 h-5"/>
                    Export List
                </button>
            </div>

            {/* Horizontally Scrollable Table on Mobile */}
            <div className="overflow-x-auto -mx-4 sm:-mx-0">
                <div className="inline-block min-w-full align-middle">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                    Gender
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                    Hall
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                    Program
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-blue-50 transition">
                                    <td className="px-6 py-1 whitespace-nowrap font-medium">
                                        {student.first_name} {student.last_name}
                                        {student.other_name && ` ${student.other_name}`}
                                    </td>
                                    <td className="px-6 py-1 text-sm text-gray-600">{student.contact || '—'}</td>
                                    <td className="px-6 py-1 text-sm">
                      <span
                          className={`px-3 py-1 rounded-full text-xs font-medium`}
                      >
                        {student.gender || '—'}
                      </span>
                                    </td>
                                    <td className="px-6 py-1 text-sm">{student.hall?.name || '—'}</td>
                                    <td className="px-6 py-1 text-sm">{student.program?.name || '—'}</td>
                                    <td className="px-6 py-1">
                                        <button
                                            onClick={() => setSelectedStudent(student)}
                                            className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                                            aria-label="View details"
                                        >
                                            <Eye className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Student Detail Modal */}
            {selectedStudent && (
                <StudentDetailModal
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default MembersList;