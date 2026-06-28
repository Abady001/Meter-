# MCP Server Setup — Meter Verse

> **Date**: 2026-05-28
> **Config**: `.opencode/opencode.json`
> **Status**: Configured — requires credentials to activate

---

## Overview

This project uses two MCP (Model Context Protocol) servers for AI-assisted development:

| Server | Purpose | Status |
|--------|---------|--------|
| **Notion** | Task management, spec tracking, documentation | Requires `NOTION_TOKEN` |
| **Odoo** | ERP integration (customers, invoices, payments) | Requires Odoo credentials |

---

## Notion MCP

**Package**: `@notionhq/notion-mcp-server` (official)

### Setup

1. Go to https://www.notion.so/profile/integrations
2. Create a new **Internal Integration** or select an existing one
3. Copy the **Internal Integration Secret** (`ntn_xxx`)
4. Connect relevant pages/databases to the integration (share page → "Connect to" → your integration)
5. Set the token in `.opencode/opencode.json`:

```json
"notion": {
  "type": "local",
  "command": ["npx", "-y", "@notionhq/notion-mcp-server"],
  "enabled": true,
  "env": {
    "NOTION_TOKEN": "ntn_your_token_here"
  }
}
```

### Available Tools (22 total)

- Page CRUD: create, retrieve, update, search
- Data source (database) operations: query, create, update, list templates
- Comment operations: create, retrieve
- Block operations: retrieve, update, delete, append children
- User operations: list, retrieve
- Move page

---

## Odoo MCP

**Package**: `@mweinheimer/odoo-mcp-server`

### Setup

1. Ensure Odoo instance is accessible (local or remote)
2. Have database name, username, and password ready
3. Configure in `.opencode/opencode.json`:

```json
"odoo": {
  "type": "local",
  "command": ["npx", "-y", "@mweinheimer/odoo-mcp-server", "--stdio"],
  "enabled": true,
  "env": {
    "ODOO_URL": "http://your-odoo-instance:8069",
    "ODOO_DB": "your_database",
    "ODOO_USERNAME": "your_username",
    "ODOO_PASSWORD": "your_password"
  }
}
```

### Features

- Full CRUD on any Odoo model
- Advanced search with domain filtering
- Custom method execution
- XML-RPC and JSON-RPC protocol support

---

## Activation

MCP servers are activated on opencode restart. After filling in credentials:

```bash
# Restart opencode for config to take effect
# Config auto-loads on startup from .opencode/opencode.json
```

> **Note**: Both servers are **disabled by default** until credentials are provided. The config file serves as documentation and ready-to-use template — just fill in the values and restart.

---

## Git Command

A custom command `git:save` is configured for quick commits:

```json
"command": {
  "git:save": {
    "description": "Stage changes, commit with TXXX format, and push to origin",
    "prompt": "Stage all changed files, commit with 'TXXX: description' format, push to origin"
  }
}
```

Usage in opencode:
```
/git:save T018: implement audit report migration
```
