import {useQuery} from '@tanstack/react-query';
import {getAllStudents, type StudentProfile} from '../services/api.ts';

/**
 * React Query hook to fetch all students
 */
export const useStudents = () => {
    return useQuery<StudentProfile[]>({
        queryKey: ['students'],
        queryFn: getAllStudents,
    });
};

/**
 * React Query hook to fetch a single student by ID
 */
export const useStudent = (id: number | undefined) => {
    return useQuery<StudentProfile>({
        queryKey: ['students', id],
        queryFn: async () => {
            if (!id) throw new Error('Student ID is required');
            const {getStudentById} = await import('../services/api.ts');
            return getStudentById(id);
        },
        enabled: !!id, // Only run query if id is provided
    });
};

