/**
 * Courses Admin API
 * Handles course administration and management
 */

import { baseApi, API_TAGS } from './base.api';
import type { ApiResponse } from '@/types';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  status: 'draft' | 'published' | 'archived';
  thumbnailUrl?: string;
  instructorName?: string;
  price?: number;
  enrollmentCount: number;
  completionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  price?: number;
  thumbnailUrl?: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: number;
  price?: number;
  thumbnailUrl?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  enrolledAt: string;
  progress: number;
  completedAt?: string;
  status: 'active' | 'completed' | 'cancelled';
}

export const coursesAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all courses (Admin - includes draft/archived)
    getAllCourses: builder.query<ApiResponse<Course[]>, void>({
      query: () => '/courses/all',
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.Course, id })),
              { type: API_TAGS.Course, id: 'ADMIN_LIST' },
            ]
          : [{ type: API_TAGS.Course, id: 'ADMIN_LIST' }],
      keepUnusedDataFor: 120,
    }),

    // Create course
    createCourse: builder.mutation<ApiResponse<Course>, CreateCourseData>({
      query: (data) => ({
        url: '/courses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.Course, id: 'ADMIN_LIST' }],
    }),

    // Update course
    updateCourse: builder.mutation<
      ApiResponse<Course>,
      { id: string; data: UpdateCourseData }
    >({
      query: ({ id, data }) => ({
        url: `/courses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Course, id },
        { type: API_TAGS.Course, id: 'ADMIN_LIST' },
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          coursesAdminApi.util.updateQueryData('getAllCourses', undefined, (draft) => {
            const course = draft.data.find((c) => c.id === id);
            if (course) {
              Object.assign(course, data);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Delete course
    deleteCourse: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/courses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.Course, id },
        { type: API_TAGS.Course, id: 'ADMIN_LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          coursesAdminApi.util.updateQueryData('getAllCourses', undefined, (draft) => {
            const index = draft.data.findIndex((c) => c.id === id);
            if (index !== -1) {
              draft.data.splice(index, 1);
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Get course enrollments
    getCourseEnrollments: builder.query<ApiResponse<CourseEnrollment[]>, string>({
      query: (id) => `/courses/${id}/enrollments`,
      providesTags: (_result, _error, id) => [
        { type: API_TAGS.Course, id: `${id}_ENROLLMENTS` },
      ],
      keepUnusedDataFor: 120,
    }),

    // Publish course
    publishCourse: builder.mutation<ApiResponse<Course>, string>({
      query: (id) => ({
        url: `/courses/${id}/publish`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.Course, id },
        { type: API_TAGS.Course, id: 'ADMIN_LIST' },
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          coursesAdminApi.util.updateQueryData('getAllCourses', undefined, (draft) => {
            const course = draft.data.find((c) => c.id === id);
            if (course) {
              course.status = 'published';
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  useGetCourseEnrollmentsQuery,
  usePublishCourseMutation,
} = coursesAdminApi;
