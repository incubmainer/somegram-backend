CREATE SEQUENCE IF NOT EXISTS client_seq START 1;

CREATE OR REPLACE FUNCTION set_sequential_username()
RETURNS TEXT AS $$
DECLARE
    new_username TEXT;
BEGIN
    new_username := 'client' || nextval('client_seq')::TEXT;
    RETURN new_username;
END;
$$ LANGUAGE plpgsql;
