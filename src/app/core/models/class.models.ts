// src/app/core/models/class.models.ts

import { Course } from '../../features/courses/models/course.model';
import { User } from '../models/user.models.js';

/**
 * Representa una clase (sesión) de un curso.
 * Coincide con la entidad ClassSession del backend.
 */
export interface ClassSession {
  id?: number;
  name: string;
  date: string; // formato ISO (yyyy-MM-dd)
  course: Course;
  instructor: User;
  organization?: {
    id: number;
    name: string;
  };
}
