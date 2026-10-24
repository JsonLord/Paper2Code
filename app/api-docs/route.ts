import { NextResponse } from 'next/server';

export async function GET() {
  const docs = {
    endpoints: [
      {
        path: "/health",
        method: "GET",
        purpose: "Health check endpoint",
        response: { status: "ok" }
      },
      {
        path: "/api-docs",
        method: "GET",
        purpose: "API Documentation",
        response: { endpoints: "[]" }
      },
      {
        path: "/api/submit-job",
        method: "POST",
        purpose: "Transform a research paper into code and push to GitHub",
        request: {
          arxivUrl: "string (optional)",
          paperContent: "string (optional)",
          repo: "string (required, e.g., 'owner/repo')",
          paperName: "string (optional)",
          model: "string (optional)"
        },
        response: {
          success: true,
          githubUrl: "string",
          branch: "string",
          filesCount: "number"
        }
      },
      {
        path: "/api/scrape-website",
        method: "POST",
        purpose: "Scrape a website and return its content in markdown/HTML",
        request: {
          url: "string (required)",
          formats: "string[] (optional, default: ['markdown', 'html'])"
        },
        response: {
          success: true,
          data: {
            title: "string",
            content: "string",
            markdown: "string",
            html: "string"
          }
        }
      },
      {
        path: "/api/search",
        method: "POST",
        purpose: "Perform a web search using Firecrawl",
        request: {
          query: "string (required)"
        },
        response: {
          results: [
            {
              url: "string",
              title: "string",
              description: "string",
              screenshot: "string | null",
              markdown: "string"
            }
          ]
        }
      },
      {
        path: "/api/analyze-edit-intent",
        method: "POST",
        purpose: "Analyze intent for editing code",
        request: {
          prompt: "string",
          files: "any[]"
        },
        response: {
          intent: "string"
        }
      },
      {
        path: "/api/apply-ai-code",
        method: "POST",
        purpose: "Apply AI generated code changes",
        request: {
          code: "string",
          sandboxId: "string"
        },
        response: {
          success: "boolean"
        }
      },
      {
        path: "/api/conversation-state",
        method: "GET/POST/DELETE",
        purpose: "Manage conversation state",
        request: "Varies",
        response: "Varies"
      }
    ]
  };
  return NextResponse.json(docs);
}
