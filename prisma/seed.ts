import bcrypt from 'bcrypt';
import prisma from '../src/config/prisma';

import mockUser from './mockUser';
import mockUserProfile from './mockUserProfile';
import mockDriverProfile from './mockDriverProfile';
import mockEstimateRequests from './mockEstimateRequest';
import mockEstimates from './mockEstimate';
import mockAddress from './mockAddress';
import mockReview from './mockReview';
import mockFavoriteDriver from './mockFavoriteDriver';
import mockNotification from './mockNotification';

import { UserType, EstimateRequest } from './dataType';

async function main() {
  console.log('Start seeding...');

  // 기존 데이터 삭제
  await prisma.notification.deleteMany();
  await prisma.favoriteDriver.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.estimateRequest.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();

  // USER 및 DRIVER 생성 (비밀번호 해싱)
  const usersWithHashedPw = await Promise.all(
    mockUser().map(async (u) => {
      if (u.provider === 'local' && u.password) {
        const hashedPw = await bcrypt.hash(u.password, 10);
        return { ...u, password: hashedPw };
      }
      return u;
    }),
  );

  await prisma.user.createMany({
    data: usersWithHashedPw,
    skipDuplicates: true,
  });

  // USER와 DRIVER 구분
  const userIds = usersWithHashedPw.filter((u) => u.type === UserType.USER).map((u) => u.id);
  const driverIds = usersWithHashedPw.filter((u) => u.type === UserType.DRIVER).map((u) => u.id);

  // UserProfile 생성
  const userProfiles = mockUserProfile(userIds);
  for (const profile of userProfiles) {
    await prisma.userProfile.create({ data: profile });
  }

  // DriverProfile 생성
  const driverProfiles = mockDriverProfile(driverIds);
  for (const profile of driverProfiles) {
    await prisma.driverProfile.create({ data: profile });
  }

  // EstimateRequest 생성
  const estimateRequests = mockEstimateRequests(userIds, 5);
  for (const req of estimateRequests) {
    await prisma.estimateRequest.create({ data: req });
  }

  // Estimate 생성
  const estimates = mockEstimates(estimateRequests, driverIds);
  for (const est of estimates) {
    await prisma.estimate.create({ data: est });
  }

  // Address 생성
  const addresses = mockAddress(estimateRequests);
  for (const addr of addresses) {
    await prisma.address.create({ data: addr });
  }

  // EstimateRequest를 id 기준으로 Map 생성
  const estimateRequestsMap: Map<string, EstimateRequest> = new Map(
    estimateRequests.map((req: EstimateRequest) => [req.id, req]),
  );

  // Review 생성
  const reviews = mockReview(estimates, estimateRequestsMap);
  for (const rev of reviews) {
    await prisma.review.create({ data: rev });
  }

  // FavoriteDriver 생성
  const favorites = mockFavoriteDriver(userIds, driverIds);
  for (const fav of favorites) {
    await prisma.favoriteDriver.create({ data: fav });
  }

  // Notification 생성
  const notifications = mockNotification(userIds, 5);
  for (const note of notifications) {
    await prisma.notification.create({ data: note });
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
