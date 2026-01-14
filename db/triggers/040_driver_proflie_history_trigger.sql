/*DriverProfile 테이블 Trigger 적용*/

DROP TRIGGER IF EXISTS trg_driver_profile_history ON "DriverProfile";

CREATE TRIGGER trg_driver_profile_history
AFTER INSERT OR UPDATE OR DELETE
ON "DriverProfile"
FOR EACH ROW
EXECUTE FUNCTION public.log_history();