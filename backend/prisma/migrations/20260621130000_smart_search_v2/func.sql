CREATE OR REPLACE FUNCTION sim_system.search_enterprise(search_query text, max_results int DEFAULT 10)
RETURNS TABLE(result_type text, entity_id uuid, label text, sublabel text, route text, relevance real) AS $$
DECLARE q_norm text;
BEGIN
  q_norm := lower(regexp_replace(regexp_replace(search_query, '[\u0650-\u065F\u064B-\u0652]', '', 'g'), '[\u0625\u0623\u0622]', '\u0627', 'g'));
  RETURN QUERY
  SELECT * FROM (
    SELECT 'customer'::text, c.id::uuid, c.name::text, c.customer_code::text, ('customer:' || c.id)::text,
      greatest(CASE WHEN lower(c.name) LIKE lower('%' || search_query || '%') THEN 0.8 ELSE 0 END,
        CASE WHEN lower(c.customer_code) LIKE lower('%' || search_query || '%') THEN 1.0 ELSE 0 END,
        CASE WHEN c.phone LIKE '%' || search_query || '%' THEN 0.9 ELSE 0 END)::real
    FROM sim_system.customers c
    WHERE lower(c.name) LIKE lower('%' || search_query || '%') OR lower(c.customer_code) LIKE lower('%' || search_query || '%') OR c.phone LIKE '%' || search_query || '%'
    UNION ALL
    SELECT 'meter'::text, m.id::uuid, m.serial_number::text, m.meter_type::text, ('meter:' || m.id)::text, 0.7::real
    FROM sim_system.meters m WHERE lower(m.serial_number) LIKE lower('%' || search_query || '%') OR lower(m.brand) LIKE lower('%' || search_query || '%')
    UNION ALL
    SELECT 'invoice'::text, i.id::uuid, i.invoice_number::text, i.status::text, ('invoice:' || i.id)::text, 0.7::real
    FROM sim_system.invoices i WHERE lower(i.invoice_number) LIKE lower('%' || search_query || '%')
    UNION ALL
    SELECT 'payment'::text, p.id::uuid, p.payment_number::text, p.status::text, ('payment:' || p.id)::text, 0.7::real
    FROM sim_system.payments p WHERE lower(p.payment_number) LIKE lower('%' || search_query || '%')
    UNION ALL
    SELECT 'project'::text, pr.id::uuid, pr.name::text, pr.code::text, ('project:' || pr.id)::text, 0.7::real
    FROM sim_system.projects pr WHERE lower(pr.name) LIKE lower('%' || search_query || '%') OR lower(pr.code) LIKE lower('%' || search_query || '%')
    UNION ALL
    SELECT 'wallet'::text, wa.id::uuid, wa.account_name::text, wa.account_code::text, ('wallet:' || wa.id)::text, 0.6::real
    FROM features.wallet_accounts wa WHERE lower(wa.account_name) LIKE lower('%' || search_query || '%') OR lower(wa.account_code) LIKE lower('%' || search_query || '%')
  ) sub ORDER BY relevance DESC LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;
