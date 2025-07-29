-- Inserir o usuário admin com senha hash
INSERT INTO admin_users (username, password_hash) 
VALUES ('neigirao', crypt('PCFClub!21', gen_salt('bf')));