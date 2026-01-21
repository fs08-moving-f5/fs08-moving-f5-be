CREATE INDEX IF NOT EXISTS driverprofile_regions_idx
ON "DriverProfile"
USING GIN (regions);

CREATE INDEX IF NOT EXISTS driverprofile_services_idx
ON "DriverProfile"
USING GIN (services);