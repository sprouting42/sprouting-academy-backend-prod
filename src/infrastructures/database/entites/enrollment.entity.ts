export interface EnrollmentEntity {
  id: string;
  userId: string;
  courseId: string;
  paymentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
