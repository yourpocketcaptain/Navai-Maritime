# Workflow: Cloudflare Pages Deployment

This workflow ensures that the website is correctly built and published to Cloudflare Pages using the Wrangler CLI.

## Deployment Steps

1.  **Preparation**: Ensure all changes are saved and your local build works.
2.  **Deployment**: Run the following command in your terminal:
    ```bash
    npm run deploy
    ```
    *This command will automatically execute `npm run build` and then upload the `out` directory to the `navai-maritime` project on Cloudflare.*

3.  **Verification**: Once the command completes, you will receive a deployment URL. The changes will be live on [navaitech.com](https://navaitech.com) within seconds.

## Environment Variables

When adding new environment variables (e.g., for Firebase or AI services), ensure they are added in two places:
1.  **Locally**: In `.env.local` for development.
2.  **Cloudflare**: In the Cloudflare Pages dashboard under **Settings -> Environment variables** for production.

## Troubleshooting

- **Authentication Error**: If Wrangler asks you to login, run:
  ```bash
  npx wrangler login
  ```
- **Project Mismatch**: The project name is set to `navai-maritime`. If this ever changes, update the `deploy` script in `package.json`.
