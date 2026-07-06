# Deployment Agent Instructions

This codebase is configured for deployment on Hugging Face Spaces.

## Deployment Configuration

### Target Space
- **Profile:** Leon4gr45
- **Space:** paper2code-cli
- **Full Identifier:** Leon4gr45/paper2code-cli
- **Frontend Port:** 7860

### SDK
- **SDK:** docker

## Mandatory Endpoints
- /api/health: Returns HTTP 200 when ready.
- /api/api-docs: Documentation of all API endpoints.

## HF Space Secrets
To fully configure the application, the following secrets should be set in the Hugging Face Space settings:

- \`OPENAI_API_KEY\`: Your OpenAI API key.
- \`OPENAI_BASE_URL\`: (Optional) Custom base URL for OpenAI-compatible APIs.
- \`DEFAULT_MODEL\`: (Optional) The default model to use (e.g., \`openai/gpt-4o\`).
- \`FIRECRAWL_API_KEY\`: Required for web search and scraping.
- \`PERSONAL_ACCESS_TOKEN\`: GitHub PAT with repo access for pushing code.
- \`ANTHROPIC_API_KEY\`: (Optional) For Anthropic models.
- \`GEMINI_API_KEY\`: (Optional) For Google Gemini models.
- \`GROQ_API_KEY\`: (Optional) For Groq models.

## Deployment Workflow
To deploy, use:
\`\`\`bash
hf upload Leon4gr45/paper2code-cli --repo-type=space
\`\`\`

Monitor logs using:
- Build logs: \`curl -N -H "Authorization: Bearer \$HF_TOKEN" "https://huggingface.co/api/spaces/Leon4gr45/paper2code-cli/logs/build"\`
- Run logs: \`curl -N -H "Authorization: Bearer \$HF_TOKEN" "https://huggingface.co/api/spaces/Leon4gr45/paper2code-cli/logs/run"\`
