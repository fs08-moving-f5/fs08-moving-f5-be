/*UserProfile 테이블 Trigger 적용*/

DROP TRIGGER IF EXISTS trg_user_profile_history ON "UserProfile";

CREATE TRIGGER trg_user_profile_history
AFTER INSERT OR UPDATE OR DELETE
ON "UserProfile"
FOR EACH ROW
EXECUTE FUNCTION public.log_history();