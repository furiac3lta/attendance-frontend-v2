export interface Payment {
  studentId: number;
  courseId: number;
  month: number;
  year: number;
  paid: boolean;
  method?: string;
  amount?: number;
}
