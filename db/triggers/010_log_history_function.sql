/* Tigger 공통 함수 */

CREATE OR REPLACE FUNCTION public.log_history()
RETURNS TRIGGER AS $$
DECLARE
  v_entity_id TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_entity_id := OLD.id::text;
  ELSE
    v_entity_id := NEW.id::text;
  END IF;

  INSERT INTO "History" (
    id,
    "actionType",
    "entityType",
    "entityId",
    "previousData",
    "newData",
    "createdAt"
  )
  VALUES (
    gen_random_uuid(),
    TG_OP,
    TG_TABLE_NAME,
    v_entity_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    now()
  );

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
