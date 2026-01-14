/*Review 테이블 Trigger 적용*/

DROP TRIGGER IF EXISTS trg_review_history ON "Review";

CREATE TRIGGER trg_review_history
AFTER INSERT OR UPDATE OR DELETE
ON "Review"
FOR EACH ROW
EXECUTE FUNCTION public.log_history();