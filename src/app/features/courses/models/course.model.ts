// src/app/features/courses/models/course.models.ts

import { User } from '../../../core/models/user.models';

export interface Course {
  id?: number;
  name: string;
  description?: string;
  universityProgram?: string;

 // ✅ Nuevos campos utilizados en el front
  instructorId?: number | null;
  instructorName?: string | null;

  // ✅ Campo usado solo en UI (no viene del backend)
  selectedInstructorId?: number | null;

  // 🔹 Alumnos inscriptos
  students?: User[];

  // 🔹 Organización a la que pertenece
  organization?: {
    id: number;
    name: string;
  };
}
