import { Address } from '@/generated/client';
import { ServiceEnum } from '@/generated/enums';

export interface createEstimateRequestParams {
  userId: string;
  movingType: ServiceEnum;
  movingDate: Date;
  from: Address;
  to: Address;
}
