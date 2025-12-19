import splitAddresses from '@/utils/splitAddresses';
import prisma from '../../../config/prisma';
import { createEstimateRequestParams } from '@/types/userEstimate';

// 진행 중인 견적 요청 여부 (유저)
export async function getEstimateRequestsInProgressRepository({ userId }: { userId: string }) {
  return prisma.$transaction(async (tx) => {
    const estimateReqInProgress = await tx.estimateRequest.findMany({
      where: { userId, status: 'PENDING' },
      include: {
        user: true,
        addresses: true,
      },
    });
    return estimateReqInProgress.map((req) => {
      const { from, to } = splitAddresses(req.addresses);

      return {
        id: req.id,
        name: req.user.name,
        movingType: req.movingType,
        movingDate: req.movingDate,
        isDesignated: req.isDesignated,
        from: from ? { sido: from.sido, sigungu: from.sigungu } : null,
        to: to ? { sido: to.sido, sigungu: to.sigungu } : null,
      };
    });
  });
}

// 견적 요청 (유저)
export async function createEstimateRequestRepository({
  userId,
  movingType,
  movingDate,
  from,
  to,
}: createEstimateRequestParams) {
  return prisma.$transaction(async (tx) => {
    const estimateReq = await tx.estimateRequest.create({
      data: {
        user: {
          connect: { id: userId },
        },
        movingType,
        movingDate,
        addresses: {
          create: [
            { ...from, addressType: 'FROM' },
            { ...to, addressType: 'TO' },
          ],
        },
      },
      include: {
        user: true,
        addresses: true,
      },
    });

    const { from: _from, to: _to } = splitAddresses(estimateReq.addresses);

    return {
      id: estimateReq.id,
      name: estimateReq.user.name,
      movingType: estimateReq.movingType,
      movingDate: estimateReq.movingDate,
      isDesignated: estimateReq.isDesignated,
      from: _from ? { sido: _from.sido, sigungu: _from.sigungu } : null,
      to: _to ? { sido: _to.sido, sigungu: _to.sigungu } : null,
    };
  });
}
