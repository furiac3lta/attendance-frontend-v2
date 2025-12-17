export interface SystemOrgRow {
  organizationName: string;
  students: number;
  courses: number;
}

export interface SystemDashboard {
  organizations: SystemOrgRow[];
}
