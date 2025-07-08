# Fibros - Sistema Web-Mobile para Gestão de Fibra Óptica

<div align="center">

![Fibros](https://img.shields.io/badge/Fibros-Sistema%20de%20Gestão-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28?logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)

</div>

## 📋 Sobre o Projeto

Fibros é um sistema completo de autenticação e gestão de usuários, com foco em **CTOs (Caixas de Terminação Óptica)** e **mapas de fibra óptica**. Desenvolvido para atender **provedores de internet**, **equipes técnicas** e **CTOs**, o sistema oferece uma interface moderna, responsiva e robusta, acessível via web e mobile.

### 🎯 Público-Alvo
- Provedores de Internet (ISPs)
- Equipes técnicas de telecomunicações
- Gestores de infraestrutura de fibra óptica
- Técnicos de campo

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 19 + Vite
- **Backend/Banco:** Firebase (NoSQL, Autenticação, Firestore)
- **Linguagem:** TypeScript
- **Estilo:** CSS customizado com paleta exclusiva
- **Arquitetura:** SPA (Single Page Application)
- **Responsividade:** Total, para desktop e mobile

## ✨ Funcionalidades Principais

### 🔐 Autenticação e Usuários
- ✅ Login seguro com Firebase Auth
- ✅ Gestão completa de usuários (CRUD)
- ✅ Controle de permissões por perfil (admin, técnico, visualizador)

### 📡 Gestão de CTOs
- ✅ Cadastro e gerenciamento de Caixas de Terminação Óptica
- ✅ Visualização de status e informações técnicas
- ✅ Histórico de manutenções

### 🗺️ Mapas de Fibra Óptica
- ✅ Visualização interativa de mapas
- 🔄 Integração futura com APIs de mapas (Google Maps/OpenStreetMap)
- ✅ Edição e anotações em tempo real

### 📊 Dashboard e Relatórios
- ✅ Visão geral dos ativos
- ✅ Métricas de desempenho
- ✅ Status em tempo real

### 📱 Interface Web-Mobile
- ✅ Adaptada para uso em campo (mobile)
- ✅ Interface completa para escritório (desktop)
- ✅ PWA ready para instalação

## 🛠️ Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Firebase
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/fibros.git
cd fibros
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Firebase

#### 3.1. Criar projeto no Firebase
1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"**
3. Digite o nome do projeto (ex: "fibros-producao")
4. Configure o Google Analytics (opcional)
5. Clique em **"Criar projeto"**

#### 3.2. Configurar Authentication
1. No painel do Firebase, vá para **"Authentication"**
2. Clique na aba **"Sign-in method"**
3. Ative o método **"Email/password"**
4. (Opcional) Configure outros provedores se necessário

#### 3.3. Configurar Firestore Database
1. No painel do Firebase, vá para **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o modo:
   - **Teste:** Para desenvolvimento (dados públicos por 30 dias)
   - **Produção:** Para produção (necessário configurar regras)
4. Selecione a localização do servidor (recomendado: us-central1)

#### 3.4. Obter credenciais do projeto
1. Vá para **"Configurações do projeto"** (ícone de engrenagem)
2. Na aba **"Geral"**, role até **"Seus aplicativos"**
3. Clique em **"</>"** (Web)
4. Registre o app com um nome (ex: "fibros-web")
5. **NÃO** marque "Configure também o Firebase Hosting"
6. Copie as credenciais fornecidas

#### 3.5. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Ambiente
VITE_APP_ENV=development
```

> ⚠️ **Importante:** Nunca commite o arquivo `.env` no Git. Ele já está no `.gitignore`.

### 4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### 5. Acesse a aplicação
Abra seu navegador e acesse: [http://localhost:5173](http://localhost:5173)

## 📁 Estrutura do Projeto

```
fibros/
├── public/
│   └── vite.svg
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   └── ExampleComponent.tsx
│   ├── pages/              # Páginas da aplicação
│   ├── services/           # Integrações (Firebase, APIs)
│   ├── hooks/              # Custom hooks
│   ├── types/              # Tipos TypeScript
│   ├── utils/              # Funções utilitárias
│   ├── assets/             # Imagens, ícones, etc.
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Ponto de entrada
├── .env                    # Variáveis de ambiente (não commitado)
├── .env.example            # Exemplo de configuração
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 Paleta de Cores

```css
:root {
  --color-1: #fde6bd;  /* Fundo claro - Bege suave */
  --color-2: #a1c5ab;  /* Elementos de destaque - Verde menta */
  --color-3: #f4dd51;  /* Atenção/alerta - Amarelo vibrante */
  --color-4: #d11e48;  /* Erros/ações críticas - Vermelho */
  --color-5: #632f53;  /* Primário/contraste - Roxo escuro */
}
```

## 🗺️ Roadmap

### ✅ Versão 1.0 (Atual)
- [x] Sistema de autenticação
- [x] Interface responsiva
- [x] Integração básica com Firebase

### 🔄 Versão 1.1 (Em desenvolvimento)
- [ ] Cadastro completo de CTOs
- [ ] Sistema de permissões avançado
- [ ] Dashboard com métricas

### 🎯 Versão 2.0 (Planejado)
- [ ] Integração com Google Maps/OpenStreetMap
- [ ] Visualização avançada de mapas
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] PWA com funcionalidades offline
- [ ] Notificações push
- [ ] API para integrações externas

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature
   ```bash
   git checkout -b feature/minha-nova-feature
   ```
3. **Commit** suas alterações
   ```bash
   git commit -m 'feat: adiciona nova funcionalidade'
   ```
4. **Push** para a branch
   ```bash
   git push origin feature/minha-nova-feature
   ```
5. Abra um **Pull Request**

### 📋 Convenções
- Use [Conventional Commits](https://www.conventionalcommits.org/)
- Mantenha o código limpo e documentado
- Teste suas alterações antes do PR
- Atualize a documentação se necessário

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- 📧 **Email:** suporte@fibros.com
- 💬 **Discord:** [Servidor da Comunidade](https://discord.gg/fibros)
- 📖 **Documentação:** [docs.fibros.com](https://docs.fibros.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/fibros/issues)

---

<div align="center">

**Desenvolvido com ❤️ para a comunidade de provedores de internet**

[⭐ Dê uma estrela se este projeto te ajudou!](https://github.com/seu-usuario/fibros)

</div>