#!/bin/bash

echo "🚀 Starting GameVerse folder setup..."

# Create folders safely by quoting and escaping special characters
echo "📁 Creating folder structure..."
mkdir -p gameverse/app/"(public)"/{leaderboard,tournaments,marketplace,about}
mkdir -p gameverse/app/"(auth)"/{login,logout}
mkdir -p gameverse/app/"(dashboard)"/teams/{register,"[id]",edit}
mkdir -p gameverse/app/"(dashboard)"/results/{submit,history}
mkdir -p gameverse/app/"(dashboard)"/profile
mkdir -p gameverse/app/"(admin)"/{verify,teams,audit,reports,settings}
mkdir -p gameverse/app/api/auth/"[...nextauth]"
mkdir -p gameverse/app/api/sheets/{append,update,read,delete}
mkdir -p gameverse/app/api/webhook
mkdir -p gameverse/app/actions
mkdir -p gameverse/components/{leaderboard,dashboard,admin,layout,forms,ui}
mkdir -p gameverse/lib
mkdir -p gameverse/public
mkdir -p gameverse/styles

# Create top-level files
echo "📄 Creating top-level files..."
touch gameverse/{.env.example,next.config.js,tailwind.config.ts,tsconfig.json,package.json,README.md}

# App-level files
touch gameverse/app/{layout.tsx,globals.css,page.tsx}

# Public pages
touch gameverse/app/"(public)"/{page.tsx,leaderboard/page.tsx,tournaments/page.tsx,marketplace/page.tsx,about/page.tsx}

# Auth pages
touch gameverse/app/"(auth)"/{login/page.tsx,logout/page.tsx}

# Dashboard pages
touch gameverse/app/"(dashboard)"/{page.tsx,teams/register/page.tsx,teams/"[id]"/page.tsx,teams/edit/page.tsx,results/submit/page.tsx,results/history/page.tsx,profile/page.tsx}

# Admin pages
touch gameverse/app/"(admin)"/{page.tsx,verify/page.tsx,teams/page.tsx,audit/page.tsx,reports/page.tsx,settings/page.tsx}

# API routes
touch gameverse/app/api/auth/"[...nextauth]"/route.ts
touch gameverse/app/api/sheets/{append/route.ts,update/route.ts,read/route.ts,delete/route.ts}
touch gameverse/app/api/webhook/route.ts

# Actions
touch gameverse/app/actions/{leaderboard.ts,teams.ts,results.ts,users.ts,admin.ts}

# Components
touch gameverse/components/leaderboard/leaderboard-table.tsx
touch gameverse/components/dashboard/{team-card.tsx,match-card.tsx,stat-card.tsx}
touch gameverse/components/admin/{moderation-panel.tsx,verification-list.tsx}
touch gameverse/components/layout/{header.tsx,footer.tsx,sidebar.tsx}
touch gameverse/components/forms/{team-form.tsx,result-form.tsx,search-input.tsx}
touch gameverse/components/ui/{badge.tsx,tabs.tsx,button.tsx,card.tsx,input.tsx,select.tsx,dialog.tsx,alert.tsx,table.tsx}

# Lib files
touch gameverse/lib/{auth.ts,sheets.ts,types.ts,utils.ts,cache.ts,constants.ts,permissions.ts}

# Public assets
touch gameverse/public/{logo.svg,favicon.ico,placeholder.png}

# Styles
touch gameverse/styles/animations.css

echo "✅ GameVerse folder structure created successfully!"