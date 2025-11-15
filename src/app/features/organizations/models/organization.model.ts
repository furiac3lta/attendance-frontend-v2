export interface Organization {
  id?: number;
  /** 🏷️ Nombre de la organización (Ej: "Irmaos Club Puerto Rico") */
  name: string;

  /** 🧩 Tipo de organización: "GIMNASIO", "COLEGIO", "INSTITUTO", etc. */
  type: string;

  /** 📍 Dirección física */
  address?: string;

  /** ☎️ Teléfono de contacto */
  phone?: string;

  /** 🖼️ Logo en formato URL */
  logoUrl?: string;

  /** 👤 Usuario administrador asignado (si existe) */
  admin?: {
    id: number;
    fullName: string;
    email: string;
  };

  /** 👥 Lista de usuarios dentro de la organización (instructores, alumnos, etc.) */
  users?: {
    id: number;
    fullName: string;
    role: string;
  }[];

  /** 🕒 Fechas opcionales */
  createdAt?: string;
  updatedAt?: string;
}
