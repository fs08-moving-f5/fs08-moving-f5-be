/*User 테이블 Trigger 적용*/

DROP TRIGGER IF EXISTS trg_user_history ON "User";

CREATE TRIGGER trg_user_history
AFTER INSERT OR UPDATE OR DELETE
ON "User"
FOR EACH ROW
EXECUTE FUNCTION public.log_history();
