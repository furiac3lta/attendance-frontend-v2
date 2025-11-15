// src/app/core/models/attendance.models.ts

/**
 * Representa una asistencia individual a una clase.
 * Coincide exactamente con el DTO del backend (AttendanceDTO).
 */
export interface AttendanceDTO {
  id?: number;

  // 🔹 Clase
  classId: number;
  className?: string;

  // 🔹 Alumno
  studentId: number;
  studentName?: string;

  // 🔹 Estado
  attended: boolean;

  // 🔹 Curso (referencia)
  courseId?: number;
  courseName?: string;

  // 🔹 Organización
  organizationId?: number;
  organizationName?: string;
}
