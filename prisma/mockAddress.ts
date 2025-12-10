import { v4 as uuid } from 'uuid';
import { Address } from './dataType';

export const mockAddress = (estimates: { id: string }[]) => {
  const addresses: Address[] = [];

  estimates.forEach((est) => {
    // FROM 주소
    addresses.push({
      id: uuid(),
      estimateRequestId: est.id, // EstimateRequest와 연결
      addressType: 'FROM',
      zoneCode: '06100',
      address: '서울시 강남구 어딘가',
      addressEnglish: 'Seoul Gangnam-gu somewhere',
      sido: '서울',
      sidoEnglish: 'Seoul',
      sigungu: '강남구',
      sigunguEnglish: 'Gangnam-gu',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // TO 주소
    addresses.push({
      id: uuid(),
      estimateRequestId: est.id,
      addressType: 'TO',
      zoneCode: '05500',
      address: '서울시 송파구 어딘가',
      addressEnglish: 'Seoul Songpa-gu somewhere',
      sido: '서울',
      sidoEnglish: 'Seoul',
      sigungu: '송파구',
      sigunguEnglish: 'Songpa-gu',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  return addresses;
};

export default mockAddress;
