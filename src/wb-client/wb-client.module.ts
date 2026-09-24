import { Global, Module } from '@nestjs/common';
import { WbClientService } from './wb-client.service';

@Global()
@Module({
  providers: [WbClientService],
  exports: [WbClientService],
})
export class WbClientModule {}
