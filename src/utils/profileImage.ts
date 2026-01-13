import { presignGetUrlIfKey } from '@/config/s3';

export const mapProfileImage = async <T extends { imageUrl?: string | null }>(
  obj: T,
): Promise<T & { imageKey: string | null; imageUrl: string | null }> => {
  const imageKey = (obj.imageUrl ?? null) as string | null;
  const signed = (await presignGetUrlIfKey(imageKey)) as string | null;
  return {
    ...obj,
    imageKey,
    imageUrl: signed,
  };
};

export const mapNullableProfileImage = async <T extends { imageUrl?: string | null }>(
  obj: T | null,
): Promise<(T & { imageKey: string | null; imageUrl: string | null }) | null> => {
  if (!obj) return null;
  return await mapProfileImage(obj);
};
