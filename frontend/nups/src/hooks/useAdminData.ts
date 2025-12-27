import {useQuery} from '@tanstack/react-query';
import {getPrograms, getHalls, getWings, type Program, type Hall, type Wing} from '../services/api.ts';

/**
 * React Query hook to fetch all programs
 */
export const usePrograms = () => {
    return useQuery<Program[]>({
        queryKey: ['programs'],
        queryFn: getPrograms,
        staleTime: 1000 * 60 * 30, // Programs don't change often, cache for 30 minutes
    });
};

/**
 * React Query hook to fetch all halls
 */
export const useHalls = () => {
    return useQuery<Hall[]>({
        queryKey: ['halls'],
        queryFn: getHalls,
        staleTime: 1000 * 60 * 30, // Halls don't change often, cache for 30 minutes
    });
};

/**
 * React Query hook to fetch all wings
 */
export const useWings = () => {
    return useQuery<Wing[]>({
        queryKey: ['wings'],
        queryFn: getWings,
        staleTime: 1000 * 60 * 30, // Wings don't change often, cache for 30 minutes
    });
};

