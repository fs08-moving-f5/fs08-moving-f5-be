/*EstimateRequest 테이블 Trigger 적용*/

DROP TRIGGER IF EXISTS trg_estimate_request_history ON "EstimateRequest";

CREATE TRIGGER trg_estimate_request_history
AFTER INSERT OR UPDATE OR DELETE
ON "EstimateRequest"
FOR EACH ROW
EXECUTE FUNCTION public.log_history();