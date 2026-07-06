import { Octokit } from 'octokit';

/**
 * Pushes files to a GitHub repository on a new branch.
 * @param repo Full repo name (e.g., "owner/repo")
 * @param branch Branch name to create
 * @param files Array of files to upload [{ path: string, content: string }]
 * @param token GitHub Personal Access Token
 */
export async function pushToGitHub(
  repo: string,
  branch: string,
  files: { path: string; content: string }[],
  token: string
) {
  const [owner, repoName] = repo.split('/');
  const octokit = new Octokit({ auth: token });

  console.log(`[github] Pushing to ${repo} on branch ${branch}...`);

  // 1. Get the default branch's last commit SHA
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo: repoName });
  const defaultBranch = repoData.default_branch;
  const { data: refData } = await octokit.rest.git.getRef({
    owner,
    repo: repoName,
    ref: `heads/${defaultBranch}`,
  });
  const parentSha = refData.object.sha;

  // 2. Create a new branch
  try {
    await octokit.rest.git.createRef({
      owner,
      repo: repoName,
      ref: `refs/heads/${branch}`,
      sha: parentSha,
    });
    console.log(`[github] Created branch ${branch}`);
  } catch (error: any) {
    if (error.status === 422) {
      console.log(`[github] Branch ${branch} already exists, continuing...`);
    } else {
      throw error;
    }
  }

  // 3. Create a tree with the new files
  const tree = files.map(file => ({
    path: file.path,
    mode: '100644' as const,
    type: 'blob' as const,
    content: file.content,
  }));

  const { data: treeData } = await octokit.rest.git.createTree({
    owner,
    repo: repoName,
    base_tree: parentSha,
    tree,
  });

  // 4. Create a commit
  const { data: commitData } = await octokit.rest.git.createCommit({
    owner,
    repo: repoName,
    message: `feat: transform paper to code - ${branch}`,
    tree: treeData.sha,
    parents: [parentSha],
  });

  // 5. Update the branch reference
  await octokit.rest.git.updateRef({
    owner,
    repo: repoName,
    ref: `heads/${branch}`,
    sha: commitData.sha,
    force: true,
  });

  console.log(`[github] Successfully pushed to ${repo}/${branch}`);
  return {
    url: `https://github.com/${repo}/tree/${branch}`,
    sha: commitData.sha
  };
}
