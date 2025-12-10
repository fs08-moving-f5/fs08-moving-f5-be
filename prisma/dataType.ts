export const ServiceEnum = ['SMALL_MOVING', 'HOME_MOVING', 'OFFICE_MOVING'] as const;

export const EstimateStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export const AddressType = {
  FROM: 'FROM',
  TO: 'TO',
} as const;

export type ServiceType = (typeof ServiceEnum)[number];
export type StatusType = keyof typeof EstimateStatus;
export type AddrType = keyof typeof AddressType;

export interface EstimateRequest {
  id: string;
  userId: string;
  movingType: ServiceType;
  movingDate: Date;
  status: StatusType;
  isDesignated: boolean;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Estimate {
  id: string;
  estimateRequestId: string;
  driverId: string;
  price: number;
  comment: string;
  rejectReason: string | null;
  status: StatusType;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  estimateRequestId: string;
  addressType: AddrType;
  zoneCode: string;
  address: string;
  addressEnglish: string;
  sido: string;
  sidoEnglish: string;
  sigungu: string;
  sigunguEnglish: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  estimateId: string;
  userId: string;
  rating: number; // 1~5
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FavoriteDriver {
  id: string;
  userId: string; // 찜한 USER
  driverId: string; // 찜 당한 DRIVER
  createdAt: Date;
  updatedAt: Date;
}

export const NotificationType = {
  REQUEST_SENT: 'REQUEST_SENT',
  REQUEST_REJECTED: 'REQUEST_REJECTED',
  REQUEST_CANCELLED: 'REQUEST_CANCELLED',
  ESTIMATE_RECEIVED: 'ESTIMATE_RECEIVED',
  ESTIMATE_CONFIRMED: 'ESTIMATE_CONFIRMED',
  ESTIMATE_REJECTED: 'ESTIMATE_REJECTED',
  ESTIMATE_EXPIRED: 'ESTIMATE_EXPIRED',
  NEW_REVIEW: 'NEW_REVIEW',
  FAVORITE_ADDED: 'FAVORITE_ADDED',
  SYSTEM_NOTICE: 'SYSTEM_NOTICE',
  PROMOTION: 'PROMOTION',
} as const;

export type NotificationTypeKey = keyof typeof NotificationType;

export interface Notification {
  id: string;
  userId: string; // 수신자
  type: NotificationTypeKey;
  message: string;
  datajson?: any;
  isRead: boolean;
  isDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const RegionEnum = [
  '서울',
  '경기',
  '인천',
  '강원',
  '충북',
  '충남',
  '대전',
  '세종',
  '전북',
  '전남',
  '광주',
  '경북',
  '경남',
  '대구',
  '부산',
  '울산',
  '제주',
] as const;

export interface UserProfile {
  id: string;
  userId: string;
  imageUrl?: string;
  regions: (typeof RegionEnum)[number][];
  services: (typeof ServiceEnum)[number][];
  createdAt: Date;
  updatedAt: Date;
}

export interface DriverProfile {
  id: string;
  driverId: string;
  imageUrl?: string;
  career?: string;
  shortIntro?: string;
  description?: string;
  regions: (typeof RegionEnum)[number][];
  services: (typeof ServiceEnum)[number][];
  createdAt: Date;
  updatedAt: Date;
}

export enum UserType {
  USER = 'USER',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN',
}
