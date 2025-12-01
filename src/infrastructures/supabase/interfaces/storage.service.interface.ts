import type { Express } from 'express-serve-static-core';

import type { IUploadFileResult } from '@/infrastructures/supabase/services/storage.service';

export interface IStorageService {
  uploadPaymentSlip(
    file: Express.Multer.File,
    enrollmentCourseId: string,
  ): Promise<IUploadFileResult>;

  deletePaymentSlip(path: string): Promise<void>;
}

export type { IUploadFileResult } from '@/infrastructures/supabase/services/storage.service';
