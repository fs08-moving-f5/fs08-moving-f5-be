/*Estimate 테이블 Trigger 적용*/

DROP TRIGGER IF EXISTS trg_estimate_history ON "Estimate";

CREATE TRIGGER trg_estimate_history
AFTER INSERT OR UPDATE OR DELETE
ON "Estimate"
FOR EACH ROW
EXECUTE FUNCTION public.log_history();