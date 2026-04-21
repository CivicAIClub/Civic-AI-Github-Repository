# Civic AI Club — Developer Onboarding Guide

Welcome to the Civic AI Club dev team. This guide covers everything you need to get set up, understand how we work together, and start contributing code.

Read the whole thing before you start. It'll take 10 minutes and save you hours of confusion later.

> **Before you do anything else:** Copy this entire guide and paste it into Cursor's AI chat (or Claude, ChatGPT, or any AI assistant you use). Tell it: "This is my team's onboarding guide. Walk me through the setup and help me with Git commands as I go." The AI will have the full context of how our repo is structured, what branch naming we use, and what the workflow is. It can run the Git commands for you, explain errors in plain English, and make sure you're doing things correctly. This is the intended way to use this guide. Don't just read it and try to memorize the commands. Let the AI be your copilot through the whole process.

---

## What's Been Set Up For You

Cayden has already created a shared GitHub repository under an organization called **CivicAIClub**. All four of the club's projects live inside this one repo, but each team has their own folder and works independently. You don't need to create anything. The structure is already there.

Here's what the repo looks like:

```
Civic-AI-Github-Repository/
├── projects/
│   ├── case-a-clc-workflow/        ← Luke & Jack
│   ├── case-b-music-studio/        ← Serena & JT
│   ├── case-c-dei-timeline/        ← Zahir & Keke
│   └── case-d-roster-export/       ← James & Magnus
├── shared/                         ← Shared code (if needed later)
├── docs/                           ← Club-wide documentation
├── .gitignore                      ← Tells Git what files to ignore
└── README.md                       ← The landing page of the repo
```

**Your code goes inside your team's folder under `projects/`.** That's the only place you should be creating or editing files. You don't touch anyone else's folder, and you don't edit anything in the root of the repo without talking to Cayden first.

---

## What is Git and GitHub?

If you've never used Git before, here's the short version.

**Git** is a tool that tracks every change anyone makes to the code. Think of it like Google Docs version history, but way more powerful. If something breaks, you can always go back to a working version. Git runs on your own computer.

**GitHub** is the website where our code lives online. It's like Google Drive for code. Everyone pushes their work up to GitHub so the whole team can see it and collaborate. GitHub is the cloud copy; your computer has the local copy.

**Key vocabulary you'll need:**

| Term | What it means |
|------|---------------|
| **Repository (repo)** | The project folder that Git tracks. Ours is called `Civic-AI-Github-Repository`. It lives on GitHub, and each of you will have a copy on your own computer. |
| **Clone** | Downloading the repo from GitHub to your computer for the first time. You only do this once. After that, you use `pull` to get updates. |
| **Branch** | A separate version of the code where you can make changes without affecting anyone else. Think of it like making a copy of a Google Doc to edit, then merging your edits back into the original when you're done. |
| **Commit** | Saving a snapshot of your changes with a short description of what you did. This is a local save — it doesn't go to GitHub until you push. |
| **Push** | Uploading your commits from your computer to GitHub. This is what makes your work visible to everyone else. |
| **Pull** | Downloading the latest changes from GitHub to your computer. You do this to make sure you have everyone else's most recent work before you start something new. |
| **Pull Request (PR)** | A request on GitHub to merge your branch into the main codebase. It shows exactly what you changed, and someone else reviews it before it gets merged. This is how code gets into the official version. |
| **Merge** | Combining your branch's changes into the main branch. This happens on GitHub after your PR is approved. |
| **Main branch** | The "official" version of the code that everyone shares. It should always work and never be broken. You don't edit it directly. |

---

## Initial Setup

This section walks you through getting everything ready on your computer. You only need to do this once. If you've already done a step (for example, you already have Git installed), skip to the next one.

### Step 1: Make sure Git is installed

**What this does:** Git is the software that tracks code changes. It needs to be on your computer before you can do anything else.

**Mac:** Open the Terminal app (search "Terminal" in Spotlight) and type:
```bash
git --version
```
If you see a version number (like `git version 2.39.0`), you already have Git and can skip to Step 2. If your Mac says Git isn't recognized or prompts you to install developer tools, follow those prompts to install it, then run the command again to confirm.

**Windows:** Open Command Prompt and type `git --version`. If you see a version number, skip to Step 2. If not, download Git from [git-scm.com](https://git-scm.com/) and install it. When the installer asks about terminal preferences, choose "Git Bash." After installing, close and reopen your terminal, then run `git --version` to confirm.

✅ **You're done with this step when** `git --version` shows a version number.

### Step 2: Tell Git who you are

**What this does:** Every time you save (commit) code, Git stamps it with your name and email so the team knows who made each change. This is a one-time configuration on your computer.

Open your terminal and run these two commands, replacing the placeholder text with your actual name and your GitHub account email:
```bash
git config --global user.name "Your Full Name"
git config --global user.email "your-github-email@example.com"
```

**Important:** Use the same email address that's on your GitHub account. If they don't match, your commits won't show up as "yours" on GitHub.

✅ **You're done with this step when** you've run both commands without errors. You can verify by running `git config --global user.name` and `git config --global user.email` and seeing your info printed back.

### Step 3: Accept the GitHub organization invite

**What this does:** Cayden has added you to the CivicAIClub organization on GitHub and to a "Developers" team. You need to accept the invite to get access to the repo.

Check your email for an invitation from GitHub to join **CivicAIClub**. Click the link and accept. If you can't find the email, go to [github.com/CivicAIClub](https://github.com/CivicAIClub) while logged into GitHub and you should see a banner to accept.

If you haven't received an invite at all, message Cayden with your GitHub username so he can add you.

✅ **You're done with this step when** you can visit [github.com/CivicAIClub/Civic-AI-Github-Repository](https://github.com/CivicAIClub/Civic-AI-Github-Repository) and see the code and folders.

### Step 4: Clone the repo to your computer

**What this does:** This downloads the entire project from GitHub onto your computer so you can work on it locally. You only do this once. After this, you'll use `git pull` to get updates.

In your terminal, navigate to wherever you want the project folder to live (Desktop is fine), then clone:
```bash
cd ~/Desktop
git clone https://github.com/CivicAIClub/Civic-AI-Github-Repository.git
```

This creates a folder called `Civic-AI-Github-Repository` on your Desktop containing all the project files.

If it asks for your GitHub username and password, you may need to set up a Personal Access Token instead of using your password. Go to GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token. Give it `repo` permissions, copy the token, and use that as your password when Git asks.

✅ **You're done with this step when** you can see the `Civic-AI-Github-Repository` folder on your computer and it contains folders like `projects/`, `shared/`, and `docs/`.

### Step 5: Open it in Cursor

**What this does:** Cursor is the code editor we're using. Opening the repo folder in Cursor lets you browse, edit, and run code, and it has a built-in terminal for Git commands.

Open Cursor. Go to File > Open Folder (or just drag the folder in). Select the `Civic-AI-Github-Repository` folder. You should see the full folder structure in the left sidebar.

From here on out, you can use Cursor's built-in terminal (View > Terminal, or `` Ctrl+` ``) for all your Git commands instead of the separate Terminal app.

✅ **You're done with this step when** you can see the folder structure in Cursor's sidebar and can open a terminal inside Cursor.

---

## How We Work: The Branch Workflow

This is the most important section. This is how every piece of code gets written and shared across the team.

### The big picture

Nobody edits the main version of the code directly. Instead, you create a **branch** (your own separate workspace), do your work there, then submit a **Pull Request** on GitHub asking to merge your changes into the main version. Someone reviews it, and once approved, it gets merged in.

This protects everyone. If your code has a bug, it doesn't break things for the other three teams. And if you need to throw away an experiment, you just delete the branch. The main version stays clean.

Here's the full cycle, explained step by step:

### Step 1: Pull the latest main

**What this does:** Downloads any changes other teams have merged since you last worked. This makes sure you're starting from the most up-to-date version of the code, not an old copy.

**When to do this:** Every time you sit down to start a new piece of work.

```bash
git checkout main
git pull origin main
```

The first command (`git checkout main`) switches you to the main branch. If you were on another branch from a previous session, this brings you back.

The second command (`git pull origin main`) downloads any new changes from GitHub. `origin` just means "the version on GitHub."

If you were already on `main` and nothing has changed, it'll say "Already up to date." That's fine.

### Step 2: Create a new branch

**What this does:** Creates your own workspace where you can write code without affecting anyone else. Think of it like branching off a copy of the main document to edit privately.

```bash
git checkout -b case-X/short-description
```

Replace `X` with your case letter (a, b, c, or d). Replace `short-description` with a few words about what you're building. All lowercase, use hyphens between words, no spaces.

The `-b` flag means "create a new branch and switch to it." After running this, you're on your new branch. Any changes you make will only exist on this branch until you merge them later.

**Good branch names:**
```bash
git checkout -b case-a/canvas-api-setup
git checkout -b case-b/student-profile-schema
git checkout -b case-c/youtube-audio-scraper
git checkout -b case-d/chrome-extension-v1
```

**Bad branch names (don't do these):**
```bash
git checkout -b my-branch              # Missing the case-X/ prefix
git checkout -b Case-A/Canvas Setup    # No uppercase, no spaces
git checkout -b fix                    # Too vague, no prefix
```

✅ **You're on your branch when** the terminal shows the branch name, or you run `git branch` and see a `*` next to your branch name.

### Step 3: Write your code

Do your work. Build your feature, fix a bug, whatever the task is. Open files in Cursor, write code, save files.

**The one rule here: only create and edit files inside your `projects/case-X/` folder.** Don't touch anyone else's project folder. Don't edit the root README or any files outside your project directory.

### Step 4: Stage and commit your changes

**What this does:** Commits are like save points. Each commit captures a snapshot of your code at that moment with a message describing what changed. Commits are saved locally on your computer. They don't go to GitHub until you push (Step 5).

When you've made some progress you want to save:
```bash
git add .
git commit -m "Add Canvas API authentication setup"
```

The first command (`git add .`) tells Git "I want to include all my changes in the next commit." The `.` means "everything I've changed." You can also add specific files by name (`git add myfile.py`) if you only want to commit some changes.

The second command (`git commit -m "..."`) saves the snapshot. The text in quotes is your commit message. It should describe what you did in plain English.

**Good commit messages:**
- `"Add student profile database schema"`
- `"Fix date parsing for assignments without due dates"`
- `"Create basic Chrome extension popup UI"`

**Bad commit messages:**
- `"stuff"`
- `"fixed it"`
- `"asdfasdf"`
- `"WIP"`

**How often should you commit?** Every time you finish a small, working piece of something. Don't wait until you've written 500 lines to make your first commit. If you added a new function and it works, commit. If you fixed a bug, commit. Small, frequent commits are much easier to work with than one giant commit at the end.

### Step 5: Push your branch to GitHub

**What this does:** Until now, all your commits only exist on your computer. Pushing uploads them to GitHub so they're backed up and visible to the team.

```bash
git push origin case-X/your-branch-name
```

For example:
```bash
git push origin case-a/canvas-api-setup
```

`origin` means GitHub. You're telling Git: "send my branch to GitHub."

**First-time push:** The first time you push a brand new branch, Git might say something like "The current branch has no upstream branch." If that happens, run the command it suggests, which will look like:
```bash
git push --set-upstream origin case-a/canvas-api-setup
```

After that first time, `git push` by itself will work for subsequent pushes on the same branch.

✅ **You're done with this step when** you can go to [github.com/CivicAIClub/Civic-AI-Github-Repository](https://github.com/CivicAIClub/Civic-AI-Github-Repository) and see your branch listed.

### Step 6: Open a Pull Request (PR)

**What this does:** A Pull Request is how your code goes from "on my branch" to "in the official main version." It creates a page on GitHub showing exactly what you changed, and lets someone else review it before it's merged. This is a quality check.

1. Go to [github.com/CivicAIClub/Civic-AI-Github-Repository](https://github.com/CivicAIClub/Civic-AI-Github-Repository) in your browser.
2. You'll see a yellow banner near the top saying your branch had recent pushes, with a green **"Compare & pull request"** button. Click it.
3. **Title:** Write a clear title describing what this PR adds or changes (e.g., "Add Canvas API authentication for student data pull").
4. **Description:** Write a few sentences explaining what you built, why, and anything the reviewer should pay attention to. If there are known issues or things still in progress, say so.
5. Click **"Create pull request"**.

If you don't see the yellow banner, click the "branches" dropdown near the top of the repo page, find your branch, and there will be an option to open a PR from there.

### Step 7: Get a review, then merge

**What this does:** Someone else looks at your changes to make sure they make sense and don't break anything. This is required — the repo is configured so that you cannot merge without at least one approval.

After you open the PR, tag your project partner or Cayden as a reviewer. They'll look at the code on GitHub, and might leave comments asking questions or requesting changes. If they request changes, make them on your local branch, commit, and push again. The PR updates automatically.

Once someone approves the PR, you'll see a green **"Merge pull request"** button. Click it. Your code is now part of `main`.

GitHub will prompt you to delete the branch after merging. Go ahead and delete it — it's been merged, so you don't need it anymore.

**After merging, update your local computer:**
```bash
git checkout main
git pull origin main
```

This switches you back to `main` and downloads the version that now includes your merged changes. You're ready to start a new branch for your next task. Go back to Step 1.

---

## The Three Rules

These are non-negotiable:

**1. Never push directly to `main`.** Always use a branch and a Pull Request. The repo has branch protection turned on, meaning GitHub will actually block you if you try to push to main directly. But understand the reason behind it: `main` is the shared, working version. If broken code gets in there, it affects all four teams.

**2. Stay in your folder.** Your code goes in `projects/case-X/`. Don't edit files in another team's folder. Don't edit the root `README.md` or anything in `shared/` or `docs/` without talking to Cayden first. If your project needs something in `shared/`, bring it up and we'll coordinate.

**3. Never commit secrets.** API keys, passwords, tokens, `.env` files — none of that goes in Git. Once something is committed, it's in the history permanently, even if you delete the file later. The `.gitignore` file is already set up to block common secret files (like `.env`) from being committed, but it can't catch everything. If you're creating a file that contains any kind of key or password, name it something that `.gitignore` covers, or ask before committing. When in doubt, ask.

---

## Common Situations and Fixes

### "I don't know what branch I'm on"
```bash
git branch
```
The branch with a `*` next to it is your current branch. If it says `* main`, you need to create or switch to a feature branch before making changes.

### "I made changes but I'm not sure what's different"
```bash
git status
```
This lists every file you've changed, added, or deleted since your last commit. Red files are unstaged (not yet added). Green files are staged (ready to commit).

### "I want to see exactly what I changed in a file"
```bash
git diff
```
This shows a line-by-line comparison of what changed. Lines starting with `+` are additions; lines starting with `-` are deletions.

### "I messed up and want to undo everything since my last commit"
```bash
git checkout -- .
```
This resets all files to the way they were at your last commit. **Your changes are gone permanently after this.** Only use it if you're sure you want to start over.

### "I accidentally started working on main instead of a branch"
If you've been editing files but haven't committed yet, you can move your work to a new branch without losing anything:
```bash
git stash
git checkout -b case-X/your-feature
git stash pop
```
The first command temporarily saves your changes. The second creates and switches to a new branch. The third brings your changes back on the new branch.

### "My push got rejected"
This usually means your project partner pushed changes to the same branch and your copy is behind. Run:
```bash
git pull origin your-branch-name
```
This downloads their changes and tries to combine them with yours. If Git can do it automatically, you're good. Push again.

If Git says there's a **merge conflict**, it means both of you edited the same lines in the same file. Git doesn't know which version to keep, so it marks the file with conflict markers that look like this:
```
<<<<<<< HEAD
your version of the code
=======
their version of the code
>>>>>>> origin/branch-name
```
Open the file, decide which version to keep (or combine them), delete the `<<<<<<<`, `=======`, and `>>>>>>>` markers, save the file, then:
```bash
git add .
git commit -m "Resolve merge conflict in filename.py"
git push origin your-branch-name
```

If you're stuck on a merge conflict, ask for help. It's better to ask than to accidentally delete someone's work.

### "I want to see what branches exist"
```bash
git branch          # shows branches on your computer
git branch -r       # shows branches on GitHub
```

---

## Your Project's README

Each project folder already has a `README.md` with details about the client, the problem, and the technical approach. Read yours before you start coding.

As your project evolves, keep the README updated. When you start adding real code, add a setup section to your README explaining:
- What someone needs to install to run your project
- How to actually run it
- Any environment variables or configuration needed

This matters because Cayden needs to be able to check on any project at any time, and other teams might want to learn from your work. If someone can't figure out how to run your project from the README alone, the README needs more detail.

---

## Quick Reference Card

Keep this open while you work until the commands become second nature.

```
# === START OF A WORK SESSION ===
git checkout main              # switch to the main branch
git pull origin main           # download the latest changes from GitHub

git checkout -b case-X/name   # create a new branch for your task


# === WHILE YOU'RE WORKING ===
git status                     # see what files you've changed
git add .                      # stage all changes for commit
git commit -m "what you did"   # save a snapshot with a description
                               # (repeat add + commit as often as you want)


# === WHEN YOU'RE READY TO SHARE ===
git push origin case-X/name   # upload your branch to GitHub
                               # then go to GitHub and open a Pull Request


# === AFTER YOUR PR IS MERGED ===
git checkout main              # switch back to main
git pull origin main           # download the merged version
                               # now start a new branch for your next task
```

---

## Questions?

If something doesn't make sense or you're stuck, ask Cayden or your project partner before doing anything drastic. Git mistakes are almost always fixable, but they're easier to fix early than late.
