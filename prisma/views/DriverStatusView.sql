CREATE OR REPLACE VIEW "DriverStatusView" AS
SELECT
  u.id AS "driverId",
  dp.career AS career,
  COALESCE(r.review_count, 0) AS review_count,
  COALESCE(r.average_rating, 0) AS average_rating,
  COALESCE(e.confirmed_estimate_count, 0) AS confirmed_estimate_count, 
  COALESCE(f.favorite_driver_count, 0) AS favorite_driver_count
FROM "User" u
LEFT JOIN "DriverProfile" dp
  ON dp."driverId" = u.id
LEFT JOIN (
  SELECT
    e."driverId",
    COUNT(*) AS review_count,
    ROUND(AVG(r.rating), 1) AS average_rating
  FROM "Review" r
  JOIN "Estimate" e ON e.id = r."estimateId"
  GROUP BY e."driverId"
) r ON r."driverId" = u.id
LEFT JOIN (
  SELECT
    "driverId",
    COUNT(*) AS confirmed_estimate_count
  FROM "Estimate"
  WHERE "status" = 'CONFIRMED'
    AND "isDelete" = false
  GROUP BY "driverId"
) e ON e."driverId" = u.id
LEFT JOIN (
  SELECT
    "driverId", COUNT(*) AS favorite_driver_count
  FROM "FavoriteDriver"
  GROUP BY "driverId"
) f ON f."driverId" = u.id
WHERE u."type" = 'DRIVER'
  AND u."isDelete" = false;
