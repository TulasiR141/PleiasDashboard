# Repository Guidelines

## Project Structure & Module Organization
Pleias Dashboard splits work between a .NET backend (`Backend/`) and a Vite/React frontend (`Frontend/`). API controllers live in `Backend/ExpertiseFrance.API/Controller`, shared domain contracts in `Backend/ExpertiseFrance.Core`, and data adapters plus repository implementations in `Backend/ExpertiseFrance.Infrastructure`. Database scripts and import packs are kept in `DBScripts/` and `DataInsertFinal/`. CI workflows reside under `.github/workflows/`. Frontend assets and shared styles sit in `Frontend/src/assets` and `Frontend/src/styles`, while reusable UI blocks belong in `Frontend/src/components`.

## Build, Test, and Development Commands
Run `npm install` inside `Frontend/` once per machine. Use `npm run dev` for the local React dev server, `npm run build` to produce the Vite bundle, and `npm run lint` to enforce ESLint rules. For the backend, execute `dotnet restore` in `Backend/` after dependency changes, `dotnet build ExpertiseFrance.sln` for CI-parity builds, and `dotnet run --project Backend/ExpertiseFrance.API` to serve the API. When proxying locally, keep `Frontend/.env.development` aligned with `appsettings.Development.json`.

## Coding Style & Naming Conventions
Respect the ESLint defaults configured in `eslint.config.js`; address `no-unused-vars` warnings before committing. Prefer functional React components with PascalCase filenames (e.g., `ProjectList.jsx`) and colocate related styles in `src/styles`. In C#, follow the `ExpertiseFrance.{Layer}` namespace pattern, suffix repositories with `Repository`, prefix interfaces with `I`, and register dependencies through `Program.cs` so they flow through ASP.NET Core DI.

## Testing Guidelines
Automated tests are not yet in place. New backend work should include `dotnet test` projects under a future `Backend/Tests/` folder, mirroring service namespaces (`ProjectServiceTests.cs`). Frontend additions should target Vitest or Testing Library specs under `Frontend/src/__tests__/` with descriptive filenames (`project-list.test.jsx`). At minimum run `npm run lint` and `dotnet build` before opening a PR, and document any manual verification steps.

## Commit & Pull Request Guidelines
Commits are short, imperative summaries (`Fix export pagination`) that group related changes by layer. PRs must describe the change, link to tracking issues, and include screenshots or curl snippets for UI/API updates. Call out configuration edits (.env, appsettings) and ensure Azure workflows (`azure-static-web-apps-...`, `main_dashboardbackend.yml`) pass before requesting review. Tag reviewers early and respond promptly to feedback.

## Environment & Security Notes
Do not commit secrets, certificates, or `.env.local`. Rely on the published `.env.example` and Azure portal secrets for production values. Update reverse-proxy targets and CORS origins through configuration files rather than in code.
