-- CreateTable
CREATE TABLE "DriverStatusView" (
    "driverId" TEXT NOT NULL,
    "career" INTEGER,
    "review_count" INTEGER NOT NULL,
    "average_rating" DOUBLE PRECISION NOT NULL,
    "confirmed_estimate_count" INTEGER NOT NULL,
    "favorite_driver_count" INTEGER NOT NULL,

    CONSTRAINT "DriverStatusView_pkey" PRIMARY KEY ("driverId")
);
