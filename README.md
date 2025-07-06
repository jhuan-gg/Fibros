# Fibros - Sistema Web-Mobile para Gestão de Fibra Óptica

Fibros é um sistema completo de autenticação e gestão de usuários, com foco em CTOs (Caixas de Terminação Óptica) e mapas de fibra óptica. Desenvolvido para atender provedores de internet, equipes técnicas e CTOs, o sistema oferece uma interface moderna, responsiva e robusta, acessível via web e mobile.

## Tecnologias Utilizadas

- **Frontend:** React 19 + Vite
- **Backend/Banco:** Firebase (NoSQL, autenticação, Firestore)
- **Estilo:** CSS customizado com paleta exclusiva
- **Arquitetura:** SPA (Single Page Application)
- **Responsividade:** Total, para desktop e mobile

## Funcionalidades Principais

- **Autenticação de Usuários:** Login seguro, integração com Firebase Auth.
- **Gestão de Usuários:** Cadastro, edição, exclusão e listagem de usuários.
- **Gestão de CTOs:** Cadastro e gerenciamento de caixas de terminação óptica.
- **Mapas de Fibra Óptica:** Visualização e edição de mapas, integração futura com APIs de mapas (Google Maps/OpenStreetMap).
- **Dashboard:** Visão geral dos ativos, status e métricas.
- **Permissões:** Controle de acesso por perfil (admin, técnico, visualizador).
- **Web-Mobile:** Interface adaptada para uso em campo (mobile) e escritório (desktop).

## Como Rodar o Projeto

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/fibros.git
   cd fibros
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure o Firebase:**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
   - Ative o Firestore Database e Authentication (Email/Senha).
   - Copie as credenciais do Firebase e crie um arquivo `.env` na raiz do projeto:
     ```
     VITE_FIREBASE_API_KEY=...
     VITE_FIREBASE_AUTH_DOMAIN=...
     VITE_FIREBASE_PROJECT_ID=...
     VITE_FIREBASE_STORAGE_BUCKET=...
     VITE_FIREBASE_MESSAGING_SENDER_ID=...
     VITE_FIREBASE_APP_ID=...
     ```
   - (Consulte a [documentação do Firebase](https://firebase.google.com/docs/web/setup) para detalhes.)

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   ```
   http://localhost:5173
   ```

## Estrutura do Projeto

```
fibros/
├── public/
├── src/
│   ├── pages/
│   │   └── Login.jsx / Login.css
│   ├── components/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── package.json
├── vite.config.js
└── README.md
```

## Paleta de Cores

- `#fde6bd` (color1) - Fundo claro
- `#a1c5ab` (color2) - Elementos de destaque
- `#f4dd51` (color3) - Atenção/alerta
- `#d11e48` (color4) - Erros/ações críticas
- `#632f53` (color5) - Primário/contraste

## Roadmap

- [ ] Integração completa com Firebase Auth e Firestore
- [ ] Cadastro e edição de CTOs
- [ ] Visualização de mapas interativos
- [ ] Permissões avançadas por perfil
- [ ] Exportação de relatórios
- [ ] PWA (Progressive Web App) para uso offline

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nome`)
3. Commit suas alterações (`git commit -m 'feat: minha feature'`)
4. Push para a branch (`git push origin feature/nome`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT.

---

