/*Address 테이블 Trigger 적용*/

DROP TRIGGER IF EXISTS trg_address_history ON "Address";

CREATE TRIGGER trg_address_history
AFTER INSERT OR UPDATE OR DELETE
ON "Address"
FOR EACH ROW
EXECUTE FUNCTION public.log_history();