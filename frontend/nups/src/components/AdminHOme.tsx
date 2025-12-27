// src/components/admin/DashboardHome.tsx
import {useMemo} from 'react';
import {useStudents} from '../hooks/useStudents.ts';

const DashboardHome = () => {
    const {data: students = [], isLoading: loading} = useStudents();

    // Calculate statistics using useMemo for performance
    const stats = useMemo(() => {
        const totalMembers = students.length;

        // Today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Count today's submissions
        const todaySubmissions = students.filter((s) =>
            s.created_at?.startsWith(today)
        ).length;

        // Gender counts
        const maleCount = students.filter((s) => s.gender === 'Male').length;
        const femaleCount = students.filter((s) => s.gender === 'Female').length;

        return {
            totalMembers,
            todaySubmissions,
            maleCount,
            femaleCount,
        };
    }, [students]);

    const {totalMembers, todaySubmissions, maleCount, femaleCount} = stats;

    return (
        <div>
            <h1 className="text-3xl mt-8 md:mt-0 font-bold text-blue-800 mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Members */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-600">Total Members</h3>
                    {loading ? (
                        <p className="text-4xl font-bold text-blue-600 mt-4">...</p>
                    ) : (
                        <p className="text-4xl font-bold text-blue-600 mt-4">{totalMembers}</p>
                    )}
                </div>

                {/* Today's Submissions */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-600">Today's Submissions</h3>
                    {loading ? (
                        <p className="text-4xl font-bold text-green-600 mt-4">...</p>
                    ) : (
                        <>
                            <p className="text-4xl font-bold text-green-600 mt-4">{todaySubmissions}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </p>
                        </>
                    )}
                </div>

                {/* Gender Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-600">Gender Breakdown</h3>
                    {loading ? (
                        <p className="text-4xl font-bold text-purple-600 mt-4">...</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-gray-700">Male</span>
                                <span className="text-2xl font-bold text-blue-700">{maleCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-medium text-gray-700">Female</span>
                                <span className="text-2xl font-bold text-pink-700">{femaleCount}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;