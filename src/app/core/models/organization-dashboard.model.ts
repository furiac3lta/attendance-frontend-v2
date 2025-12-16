export interface OrganizationDashboard {

  totalActiveStudents: number;

  studentsByCourse: {
    [courseName: string]: number;
  };

  paidStudents: number;
  debtStudents: number;

  totalRevenue: number;

  revenueByCourse: {
    [courseName: string]: number;
  };

  cashAmount: number;
  transferAmount: number;
  mercadoPagoAmount: number;
}

