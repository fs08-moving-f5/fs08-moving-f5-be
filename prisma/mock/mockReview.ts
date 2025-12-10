import { v4 as uuid } from 'uuid';
import { Estimate, EstimateRequest, Review } from './dataType';

/**
 * @param estimates - 생성할 리뷰의 대상 Estimate 배열
 * @param estimateRequestsMap - EstimateRequest를 id 기준으로 빠르게 조회하기 위한 Map
 * @param chanceOfReview - 리뷰 생성 확률 (0~1)
 */
const mockReviews = (
  estimates: Estimate[],
  estimateRequestsMap: Map<string, EstimateRequest>,
  chanceOfReview = 0.8,
): Review[] => {
  const reviews: Review[] = [];

  estimates.forEach((est) => {
    if (Math.random() > chanceOfReview) return; // 일부만 리뷰 생성

    const req = estimateRequestsMap.get(est.estimateRequestId);
    if (!req) return;

    const rating = Math.floor(Math.random() * 5) + 1;
    const content = `User ${req.userId} 리뷰 내용: 평점 ${rating}점`;

    reviews.push({
      id: uuid(),
      estimateId: est.id,
      userId: req.userId,
      rating,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  return reviews;
};

export default mockReviews;
