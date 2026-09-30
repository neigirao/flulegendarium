-- READ ONLY. Run against the intended project, and export results privately.
-- Schema inventory includes backups, since those can contain personal data too.
SELECT c.table_name, c.column_name, c.data_type,
  (SELECT string_agg(tc.constraint_name || ':' || rc.delete_rule, ', ')
   FROM information_schema.key_column_usage k
   JOIN information_schema.table_constraints tc
     ON tc.constraint_name=k.constraint_name AND tc.constraint_schema=k.constraint_schema
   JOIN information_schema.referential_constraints rc
     ON rc.constraint_name=tc.constraint_name AND rc.constraint_schema=tc.constraint_schema
   WHERE k.table_schema=c.table_schema AND k.table_name=c.table_name
     AND k.column_name=c.column_name) AS foreign_keys
FROM information_schema.columns c
WHERE c.table_schema='public'
  AND (c.column_name IN ('user_id','owner_id','author_id','created_by','reporter_id','target_user_id','suggested_by')
    OR c.table_name ILIKE '%backup%')
ORDER BY c.table_name,c.ordinal_position;
SELECT bucket_id,count(*) AS private_objects
FROM storage.objects GROUP BY bucket_id ORDER BY bucket_id;
SELECT policyname,tablename,cmd,qual,with_check FROM pg_policies
WHERE schemaname IN ('public','storage') ORDER BY schemaname,tablename,policyname;
