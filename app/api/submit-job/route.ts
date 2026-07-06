import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getProviderForModel } from "@/lib/ai/provider-manager";
import { extractFilesFromAI, sanitizeBranchName } from "@/lib/ai-utils";
import { pushToGitHub } from "@/lib/github";
import { appConfig } from "@/config/app.config";
import { fetchArxivPaper } from "@/lib/arxiv";

export async function GET() {
  return NextResponse.json({ message: "Submit job endpoint is active. Use POST to submit a paper." });
}

export async function POST(request: NextRequest) {
  try {
    const { 
      arxivUrl, 
      paperContent, 
      repo, 
      paperName: providedPaperName,
      model = appConfig.ai.defaultModel 
    } = await request.json();

    if (!repo) {
      return NextResponse.json({ error: "Target GitHub repository is required (e.g. 'owner/repo')" }, { status: 400 });
    }

    const githubToken = process.env.PERSONAL_ACCESS_TOKEN;
    if (!githubToken) {
      return NextResponse.json({ error: "GitHub PERSONAL_ACCESS_TOKEN not configured in environment" }, { status: 500 });
    }

    let finalPaperContent = paperContent || "";
    let paperName = providedPaperName || "paper-to-code";

    // 1. Get paper content from Arxiv API if URL or query is provided
    if (arxivUrl && !paperContent) {
      console.log(`[submit-job] Fetching Arxiv paper: ${arxivUrl}`);
      const paper = await fetchArxivPaper(arxivUrl);
      if (paper) {
        finalPaperContent = `Title: ${paper.title}\n\nAuthors: ${paper.authors.join(', ')}\n\nSummary: ${paper.summary}`;
        paperName = paper.title;
        console.log(`[submit-job] Successfully fetched: ${paper.title}`);
      } else {
        console.warn(`[submit-job] Arxiv API failed for ${arxivUrl}, falling back to scraping`);
        // Fallback to scrape if API fails
        try {
          const scrapeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/scrape-website`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: arxivUrl })
          });
          
          if (scrapeResponse.ok) {
            const scrapeData = await scrapeResponse.json();
            if (scrapeData.success) {
              finalPaperContent = scrapeData.data.content;
            }
          }
        } catch (error) {
          console.error(`[submit-job] Error calling scrape API:`, error);
        }
      }
    }

    if (!finalPaperContent) {
      return NextResponse.json({ error: "No paper content provided or found at URL" }, { status: 400 });
    }

    // 2. Generate Code from Paper
    console.log(`[submit-job] Generating code for: ${paperName}`);
    const { client, actualModel } = getProviderForModel(model);

    const systemPrompt = `You are an expert React developer. Your task is to transform the provided research paper content into a functional React application using Vite and Tailwind CSS.
    
The application should:
1. Visualize the core concepts or findings of the paper.
2. Provide interactive components if applicable (e.g., simulators, calculators, data explorers).
3. Have a professional, clean UI.
4. Include a detailed "About" section summarizing the paper.

Output format:
Generate multiple files using the <file path="..."> format.
Always start with src/index.css, then src/App.jsx, then components.
Do NOT include tailwind.config.js or vite.config.js.

${finalPaperContent.substring(0, 10000)} // Truncated paper content for prompt`;

    const { text: generatedContent } = await generateText({
      model: client(actualModel),
      system: "You transform research papers into interactive React code.",
      prompt: systemPrompt,
    });

    // 3. Extract Files
    const files = extractFilesFromAI(generatedContent);
    if (files.length === 0) {
      return NextResponse.json({ 
        error: "AI failed to generate code in the expected format",
        rawResponse: generatedContent.substring(0, 500)
      }, { status: 500 });
    }

    // 4. Push to GitHub
    const branchName = sanitizeBranchName(paperName);
    const githubResult = await pushToGitHub(repo, branchName, files, githubToken);

    return NextResponse.json({
      success: true,
      message: `Successfully transformed paper to code and pushed to GitHub`,
      githubUrl: githubResult.url,
      branch: branchName,
      filesCount: files.length
    });

  } catch (error: any) {
    console.error("[submit-job] Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "An unexpected error occurred" 
    }, { status: 500 });
  }
}
