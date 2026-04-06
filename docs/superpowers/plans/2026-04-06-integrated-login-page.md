# Integrated Login Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the `/login` page into the shared public site layout and redesign it as a split public page that reuses the app's existing form styles.

**Architecture:** Replace the standalone top-level login route with a `(public)` route so the page automatically inherits the existing public header and footer. Keep auth behavior unchanged while updating the page structure to use shared `Input` and `Button` primitives plus an existing public image for the right-hand visual panel.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, next-intl

---

## File Map

- Delete: `armenia-service-map-frontend/app/login/page.tsx`
  Removes the standalone full-screen login page that sits outside the public shell.
- Create: `armenia-service-map-frontend/app/(public)/login/page.tsx`
  Hosts the integrated public login experience.
- Modify: `armenia-service-map-frontend/messages/en.json`
  Adds any supporting login copy needed for the new public-page layout.
- Modify: `armenia-service-map-frontend/messages/hy.json`
  Mirrors the login-copy additions for Armenian.

## Task 1: Add translation support for the richer login page

**Files:**
- Modify: `armenia-service-map-frontend/messages/en.json`
- Modify: `armenia-service-map-frontend/messages/hy.json`

- [ ] **Step 1: Write the failing test**

Read the future login page requirements and identify the additional strings the page will need beyond the existing labels:

- eyebrow or section label
- supporting subtitle
- image-panel headline
- image-panel body copy

Use these exact key names under `auth`:

```json
"loginEyebrow": "",
"loginSubtitle": "",
"loginPanelTitle": "",
"loginPanelBody": ""
```

- [ ] **Step 2: Run a red check to verify the keys do not exist yet**

Run: `rg -n '"loginEyebrow"|"loginSubtitle"|"loginPanelTitle"|"loginPanelBody"' messages/en.json messages/hy.json`
Expected: no matches

- [ ] **Step 3: Write the minimal implementation**

Add the four keys under the existing `auth` namespace in both locale files with copy that matches the public-site tone.

- [ ] **Step 4: Run the same check to verify the keys exist**

Run: `rg -n '"loginEyebrow"|"loginSubtitle"|"loginPanelTitle"|"loginPanelBody"' messages/en.json messages/hy.json`
Expected: eight matches total across both locale files

- [ ] **Step 5: Commit**

```bash
git add messages/en.json messages/hy.json
git commit -m "feat: add public login page copy"
```

## Task 2: Move login into the public route and redesign the page

**Files:**
- Delete: `armenia-service-map-frontend/app/login/page.tsx`
- Create: `armenia-service-map-frontend/app/(public)/login/page.tsx`

- [ ] **Step 1: Write the failing test**

Use the current route structure as the red baseline:

- `app/login/page.tsx` exists outside `(public)`
- `app/(public)/login/page.tsx` does not exist
- the current page uses raw `<input>` and `<button>` elements instead of shared UI primitives

- [ ] **Step 2: Run checks to verify the red baseline**

Run: `test -f app/login/page.tsx && echo old-route-present`
Expected: `old-route-present`

Run: `test -f 'app/(public)/login/page.tsx' && echo new-route-present`
Expected: no output

Run: `rg -n '<input|<button' app/login/page.tsx`
Expected: matches for raw form elements

- [ ] **Step 3: Write the minimal implementation**

Delete the standalone login page and create `app/(public)/login/page.tsx` with these requirements:

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth/auth-context';
```

The component should:

- preserve the existing login submission logic and redirect to `/admin/dashboard`
- render a public-page section with responsive padding and a subtle background
- use a responsive grid with form content on the left and image panel on the right
- use `Input` for email and password and `Button` for submit
- show the translated error message when login fails
- use an existing public image such as `/hero-support.jpg` or `/join-the-network.png`

- [ ] **Step 4: Run checks to verify the green state**

Run: `test ! -f app/login/page.tsx && echo old-route-removed`
Expected: `old-route-removed`

Run: `test -f 'app/(public)/login/page.tsx' && echo new-route-present`
Expected: `new-route-present`

Run: `rg -n 'Input|Button|hero-support.jpg|join-the-network.png|/admin/dashboard' 'app/(public)/login/page.tsx'`
Expected: matches confirming shared UI primitives, existing image usage, and preserved redirect

- [ ] **Step 5: Commit**

```bash
git add app/login/page.tsx app/(public)/login/page.tsx
git commit -m "feat: integrate login page into public layout"
```

## Task 3: Verify the integrated route builds cleanly

**Files:**
- Verify: `armenia-service-map-frontend/app/(public)/login/page.tsx`
- Verify: `armenia-service-map-frontend/messages/en.json`
- Verify: `armenia-service-map-frontend/messages/hy.json`

- [ ] **Step 1: Run the focused lint/build verification**

Run: `npm run build`
Expected: successful production build with no route conflicts for `/login`

- [ ] **Step 2: Sanity-check the finished route wiring**

Run: `rg -n 'href: .*/login|href=\"/login\"|router.push\\('/login'\\)' components app`
Expected: existing public/admin/org references still point to `/login`

Run: `find app -path '*login/page.tsx' | sort`
Expected: only `app/(public)/login/page.tsx`

- [ ] **Step 3: Commit**

```bash
git add app/(public)/login/page.tsx messages/en.json messages/hy.json
git commit -m "test: verify integrated public login route"
```
