import { Global, Module } from '@nestjs/common';

import { StorageService } from '@/infrastructures/supabase/services/storage.service';
import { SupabaseConnector } from '@/infrastructures/supabase/services/supabase-connector';
import { SupabaseManager } from '@/infrastructures/supabase/services/supabase.manager';
import { LoggerModule } from '@/modules/logger/logger.module';

@Global()
@Module({
  imports: [LoggerModule],
  providers: [
    {
      provide: SupabaseConnector.TOKEN,
      useClass: SupabaseConnector,
    },
    {
      provide: SupabaseManager.TOKEN,
      useClass: SupabaseManager,
    },
    {
      provide: StorageService.TOKEN,
      useClass: StorageService,
    },
  ],
  exports: [SupabaseManager.TOKEN, StorageService.TOKEN],
})
export class SupabaseModule {}
