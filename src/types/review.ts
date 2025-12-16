export type ReviewSort = 'latest';

export interface getReviewWrittenParams {
  userId: string;
  sort?: ReviewSort;
  offset?: number | string;
  limit?: number | string;
}
