# Scentra MVP

A modern web application leveraging Next.js 15 (App Router), React 19, Tailwind CSS, and AWS Amplify for authentication, GraphQL API, and DynamoDB. Built for scalability, maintainability, and rapid development.

---

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS (with PostCSS & autoprefixer)
- **Backend/Cloud:** AWS Amplify (Cognito Auth, AppSync GraphQL, Lambda, DynamoDB)
- **Testing:** Jest, React Testing Library

## Directory Structure
```
/
├── app/              # Main application (root-level App Router)
├── components/       # Shared React components
├── amplify/          # AWS Amplify backend resources
├── public/           # Static assets
├── pages/            # (Optional: legacy/redirects)
├── tailwind.config.js
├── postcss.config.js
├── ...
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
- Duplicate `.env.example` as `.env.local` and fill in required variables.
- **Never commit secrets.**

### 3. Development
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to view the app.

### 4. Build for Production
```bash
npm run build
npm start
```

### 5. Testing
```bash
npm run test
```
Runs Jest and React Testing Library tests.

## Styling: Tailwind CSS
- Tailwind is configured in `tailwind.config.js` to scan `app/`, `pages/`, and `components/`.
- Tailwind directives are in `app/globals.css`.
- PostCSS with autoprefixer is enabled via `postcss.config.js`.

## AWS Amplify
- Authentication via Amazon Cognito
- GraphQL API via AWS AppSync
- Serverless functions via AWS Lambda
- Database via DynamoDB
- See `/amplify/` for backend resources and configuration

## Deployment
- Separate development and production environments
- For AWS deployment, see [Amplify Next.js App Router guide](https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/#deploy-a-fullstack-app-to-aws)

## Accessibility & Best Practices
- Follows modern accessibility and performance best practices
- Uses React Server Components where possible

## License
MIT-0 License. See [LICENSE](./LICENSE).