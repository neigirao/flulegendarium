# Retrofit Visual Completo — Lendas do Flu

## Status: ✅ Implementado

### Mudanças Realizadas

1. **CSS Global**: Adicionados tokens `--background-warm` e `--gold-accent`, classe `.page-warm`
2. **Tailwind Config**: Adicionadas cores `background-warm` e `gold`
3. **Home (Index.tsx)**: Background escuro → warm off-white, textos para tokens semânticos
4. **GameModeSelection**: Redesign completo — fundo claro, cards verticais com SVG customizados
5. **Donations**: Gradiente escuro → warm off-white, cards brancos
6. **FAQ**: Background warm adicionado
7. **Auth**: Background warm adicionado
8. **SocialPage**: Background warm adicionado
9. **ProfilePage**: Background warm + fix `bg-green-500`/`bg-red-500` → `bg-success`/`bg-error`
10. **Conquistas**: Background warm + eliminados `text-flu-grena`, `bg-flu-grena`, `text-gray-600`
11. **EstatisticasPublicas**: `bg-background` → `page-warm`
12. **DailyChallengesPage**: Background warm
13. **NewsPortal**: Background warm
14. **NotFound**: Background warm + `text-flu-grena`/`bg-flu-verde`/`bg-flu-grena` → tokens semânticos
15. **GameModesPreview**: Cards glass → cards sólidos brancos com sombra
16. **GameTypeRankings**: Cards glass → cards sólidos brancos com sombra

### Princípio Mantido: Dois Temas
- **Tema Escuro**: Páginas de quiz (gameplay imersivo) — dark teal gradient mantido
- **Tema Claro**: Todas as demais páginas — fundo off-white quente (`page-warm`)
