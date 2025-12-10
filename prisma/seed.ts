import argon2 from 'argon2';
import prisma from '../src/config/prisma';
import { Prisma } from '../src/generated/client';

import mockUser from './mock/mockUser';
import mockUserProfile from './mock/mockUserProfile';
import mockDriverProfile from './mock/mockDriverProfile';
import mockEstimateRequests from './mock/mockEstimateRequest';
import mockEstimates from './mock/mockEstimate';
import mockAddress from './mock/mockAddress';
import mockReview from './mock/mockReview';
import mockFavoriteDriver from './mock/mockFavoriteDriver';
import mockNotification from './mock/mockNotification';

import { UserType, EstimateRequest } from './mock/dataType';

async function main() {
  console.log('🌱 Start seeding...\n');

  // 기존 데이터 삭제
  console.log('🗑️  Deleting existing data...');
  await prisma.notification.deleteMany();
  await prisma.favoriteDriver.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.estimateRequest.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data deleted\n');

  // USER 및 DRIVER 생성 (비밀번호 해싱)
  console.log('👥 Creating users and drivers...');
  type MockUser = {
    id: string;
    providerId: string | null;
    provider: string;
    type: UserType;
    name: string;
    email: string;
    password: string;
    phone: string;
    refreshTokens: string;
    isDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  const mockUsers: MockUser[] = mockUser() as MockUser[];
  console.log(`   Generating ${mockUsers.length} users (hashing passwords with argon2)...`);
  const usersWithHashedPw: Prisma.UserCreateManyInput[] = await Promise.all(
    mockUsers.map(async (u: MockUser): Promise<Prisma.UserCreateManyInput> => {
      if (u.provider === 'local' && u.password) {
        const hashedPw = await argon2.hash(u.password);
        return { ...u, password: hashedPw };
      }
      return u;
    }),
  );

  await prisma.user.createMany({
    data: usersWithHashedPw,
    skipDuplicates: true,
  });
  console.log(`✅ Created ${usersWithHashedPw.length} users\n`);

  // USER와 DRIVER 구분 (mockUsers에서 직접 추출)
  const userIds = mockUsers.filter((u) => u.type === UserType.USER).map((u) => u.id);
  const driverIds = mockUsers.filter((u) => u.type === UserType.DRIVER).map((u) => u.id);
  console.log(`   - ${userIds.length} USERs`);
  console.log(`   - ${driverIds.length} DRIVERs\n`);

  // UserProfile 생성
  console.log('👤 Creating user profiles...');
  const userProfiles = mockUserProfile(userIds);
  for (let i = 0; i < userProfiles.length; i++) {
    await prisma.userProfile.create({ data: userProfiles[i] });
    if ((i + 1) % 10 === 0 || i === userProfiles.length - 1) {
      process.stdout.write(`   Progress: ${i + 1}/${userProfiles.length}\r`);
    }
  }
  console.log(`\n✅ Created ${userProfiles.length} user profiles\n`);

  // DriverProfile 생성
  console.log('🚗 Creating driver profiles...');
  const driverProfiles = mockDriverProfile(driverIds);
  for (let i = 0; i < driverProfiles.length; i++) {
    await prisma.driverProfile.create({ data: driverProfiles[i] });
    if ((i + 1) % 5 === 0 || i === driverProfiles.length - 1) {
      process.stdout.write(`   Progress: ${i + 1}/${driverProfiles.length}\r`);
    }
  }
  console.log(`\n✅ Created ${driverProfiles.length} driver profiles\n`);

  // EstimateRequest 생성
  console.log('📋 Creating estimate requests...');
  const estimateRequests = mockEstimateRequests(userIds, 5);
  for (let i = 0; i < estimateRequests.length; i++) {
    await prisma.estimateRequest.create({ data: estimateRequests[i] });
    if ((i + 1) % 50 === 0 || i === estimateRequests.length - 1) {
      process.stdout.write(`   Progress: ${i + 1}/${estimateRequests.length}\r`);
    }
  }
  console.log(`\n✅ Created ${estimateRequests.length} estimate requests\n`);

  // Estimate 생성
  console.log('💰 Creating estimates...');
  const estimates = mockEstimates(estimateRequests, driverIds);
  for (let i = 0; i < estimates.length; i++) {
    await prisma.estimate.create({ data: estimates[i] });
    if ((i + 1) % 50 === 0 || i === estimates.length - 1) {
      process.stdout.write(`   Progress: ${i + 1}/${estimates.length}\r`);
    }
  }
  console.log(`\n✅ Created ${estimates.length} estimates\n`);

  // Address 생성
  console.log('📍 Creating addresses...');
  const addresses = mockAddress(estimateRequests);
  for (let i = 0; i < addresses.length; i++) {
    await prisma.address.create({ data: addresses[i] });
    if ((i + 1) % 50 === 0 || i === addresses.length - 1) {
      process.stdout.write(`   Progress: ${i + 1}/${addresses.length}\r`);
    }
  }
  console.log(`\n✅ Created ${addresses.length} addresses\n`);

  // EstimateRequest를 id 기준으로 Map 생성
  const estimateRequestsMap: Map<string, EstimateRequest> = new Map(
    estimateRequests.map((req: EstimateRequest) => [req.id, req]),
  );

  // Review 생성
  console.log('⭐ Creating reviews...');
  const reviews = mockReview(estimates, estimateRequestsMap);
  for (let i = 0; i < reviews.length; i++) {
    await prisma.review.create({ data: reviews[i] });
    if ((i + 1) % 50 === 0 || i === reviews.length - 1) {
      process.stdout.write(`   Progress: ${i + 1}/${reviews.length}\r`);
    }
  }
  console.log(`\n✅ Created ${reviews.length} reviews\n`);

  // FavoriteDriver 생성
  console.log('❤️  Creating favorite drivers...');
  const favorites = mockFavoriteDriver(userIds, driverIds);
  for (let i = 0; i < favorites.length; i++) {
    await prisma.favoriteDriver.create({ data: favorites[i] });
    if ((i + 1) % 50 === 0 || i === favorites.length - 1) {
      process.stdout.write(`   Progress: ${i + 1}/${favorites.length}\r`);
    }
  }
  console.log(`\n✅ Created ${favorites.length} favorite drivers\n`);

  // Notification 생성
  console.log('🔔 Creating notifications...');
  const notifications = mockNotification(userIds, 5);
  for (let i = 0; i < notifications.length; i++) {
    await prisma.notification.create({ data: notifications[i] });
    if ((i + 1) % 50 === 0 || i === notifications.length - 1) {
      process.stdout.write(`   Progress: ${i + 1}/${notifications.length}\r`);
    }
  }
  console.log(`\n✅ Created ${notifications.length} notifications\n`);

  console.log('🎉 Seeding finished successfully!');
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
