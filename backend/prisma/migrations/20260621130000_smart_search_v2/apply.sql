CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION sim_system.normalize_arabic(text) RETURNS text AS $$
  SELECT lower(regexp_replace(regexp_replace($1, '[\u0650-\u065F\u064B-\u0652]', '', 'g'), '[\u0625\u0623\u0622]', '\u0627', 'g'));
$$ LANGUAGE SQL IMMUTABLE STRICT;

CREATE OR REPLACE FUNCTION sim_system.search_enterprise(search_query text, max_results int DEFAULT 10)
RETURNS TABLE(result_type text, entity_id uuid, label text, sublabel text, route text, relevance real) AS $$
DECLARE q_norm text;
BEGIN
  q_norm := sim_system.normalize_arabic(search_query);
  RETURN QUERY
  SELECT * FROM (
    SELECT 'customer'::text, c.id::uuid, c.name::text, c.customer_code::text, ('customer:' || c.id)::text,
      greatest(CASE WHEN lower(c.name) LIKE lower('%' || search_query || '%') THEN 0.8 ELSE 0 END,
        CASE WHEN lower(c.customer_code) LIKE lower('%' || search_query || '%') THEN 1.0 ELSE 0 END,
        CASE WHEN c.phone LIKE '%' || search_query || '%' THEN 0.9 ELSE 0 END)::real
    FROM sim_system.customers c
    WHERE lower(c.name) LIKE lower('%' || search_query || '%') OR lower(c.customer_code) LIKE lower('%' || search_query || '%') OR c.phone LIKE '%' || search_query || '%'
    UNION ALL
    SELECT 'meter'::text, m.id::uuid, m.serial_number::text, m.meter_type::text, ('meter:' || m.id)::text,
      CASE WHEN lower(m.serial_number) LIKE lower('%' || search_query || '%') THEN 1.0 ELSE 0.5 END::real
    FROM sim_system.meters m WHERE lower(m.serial_number) LIKE lower('%' || search_query || '%') OR lower(m.brand) LIKE lower('%' || search_query || '%')
    UNION ALL
    SELECT 'invoice'::text, i.id::uuid, i.invoice_number::text, i.status::text, ('invoice:' || i.id)::text,
      CASE WHEN lower(i.invoice_number) LIKE lower('%' || search_query || '%') THEN 1.0 ELSE 0.5 END::real
    FROM sim_system.invoices i WHERE lower(i.invoice_number) LIKE lower('%' || search_query || '%')
    UNION ALL
    SELECT 'payment'::text, p.id::uuid, p.payment_number::text, p.status::text, ('payment:' || p.id)::text, 0.7::real
    FROM sim_system.payments p WHERE lower(p.payment_number) LIKE lower('%' || search_query || '%')
    UNION ALL
    SELECT 'project'::text, pr.id::uuid, pr.name::text, pr.code::text, ('project:' || pr.id)::text,
      CASE WHEN lower(pr.name) LIKE lower('%' || search_query || '%') THEN 1.0 ELSE 0.5 END::real
    FROM core.core_project pr WHERE lower(pr.name) LIKE lower('%' || search_query || '%') OR lower(pr.code) LIKE lower('%' || search_query || '%')
    UNION ALL
    SELECT 'ticket'::text, t.id::uuid, t.subject::text, t.status::text, ('ticket:' || t.id)::text, 0.6::real
    FROM sim_system.tickets t WHERE lower(t.subject) LIKE lower('%' || search_query || '%')
  ) sub ORDER BY relevance DESC LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE STRICT;
