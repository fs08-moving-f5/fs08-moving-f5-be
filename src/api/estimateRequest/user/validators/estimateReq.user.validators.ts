import { ServiceEnum } from '../../../../generated/enums.js';
import { z } from 'zod';

export const createEstimateRequestWithGeocodeSchema = z.object({
  movingType: z.nativeEnum(ServiceEnum),
  movingDate: z.string().datetime(),
  from: z.object({
    address: z.string(),
    zoneCode: z.coerce.number(),
    addressEnglish: z.string(),
    sido: z.string(),
    sidoEnglish: z.string(),
    sigungu: z.string(),
    sigunguEnglish: z.string(),
  }),
  to: z.object({
    address: z.string(),
    zoneCode: z.coerce.number(),
    addressEnglish: z.string(),
    sido: z.string(),
    sidoEnglish: z.string(),
    sigungu: z.string(),
    sigunguEnglish: z.string(),
  }),
});

export type CreateEstimateRequestWithGeocodeBody = z.infer<
  typeof createEstimateRequestWithGeocodeSchema
>;
