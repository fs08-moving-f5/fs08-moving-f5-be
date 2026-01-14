/*DriverProfile 테이블의 regions, services 컬럼 GIN 인덱스 적용*/

CREATE INDEX IF NOT EXISTS driverprofile_regions_idx
ON "DriverProfile"
USING GIN (regions);

CREATE INDEX IF NOT EXISTS driverprofile_services_idx
ON "DriverProfile"
USING GIN (services);