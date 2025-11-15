// src/app/core/models/user.models.ts

/**
 * Representa un usuario del sistema.
 * Coincide con la entidad User del backend.
 */
export interface User {
  id?: number;
  fullName: string;
  email: string;
  courses: string[]; // ← ahora cursos son solo nombres
  role: 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'USER';
  organization?: {
    id: number;
    name: string;
  };
}
