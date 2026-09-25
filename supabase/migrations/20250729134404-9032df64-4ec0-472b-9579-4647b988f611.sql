-- SEGURANCA (2026-09-25): senha removida do historico apos exposicao publica do repo.
-- As senhas admin atuais ficam fora do repositorio (cofre do dono). Migration historica: NAO reexecutar em producao.
-- Inserir o usuário admin com senha hash
INSERT INTO admin_users (username, password_hash) 
VALUES ('neigirao', crypt('SENHA-REMOVIDA-DO-REPO-VER-COFRE', gen_salt('bf')));
