/**
 * Extracts files from AI generated content using the <file path="...">...</file> format.
 */
export function extractFilesFromAI(content: string): { path: string; content: string }[] {
  const fileRegex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
  const files: { path: string; content: string }[] = [];
  let match;

  while ((match = fileRegex.exec(content)) !== null) {
    const filePath = match[1];
    const fileContent = match[2].trim();
    files.push({ path: filePath, content: fileContent });
  }

  return files;
}

/**
 * Sanitizes a string for use as a branch name.
 */
export function sanitizeBranchName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
