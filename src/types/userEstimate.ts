import { Address } from '@/generated/client';
import { ServiceEnum } from '@/generated/enums';

export interface createEstimateRequestParams {
  userId: string;
  movingType: ServiceEnum;
  movingDate: Date;
  from: Address;
  to: Address;
  /** 지정 견적 요청 시 지정된 기사(User) id */
  designatedDriverId?: string;
}
