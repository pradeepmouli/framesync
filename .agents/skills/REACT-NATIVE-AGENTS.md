# React Native/Expo Agent System

## Overview

The **senaiverse/claude-code-reactnative-expo-agent-system** is a comprehensive AI-powered toolkit specifically designed for React Native and Expo mobile app development.

**Repository**: [senaiverse/claude-code-reactnative-expo-agent-system](https://github.com/senaiverse/claude-code-reactnative-expo-agent-system)

## What It Includes

### 7 Core Production-Ready Agents

**Tier S: Meta Orchestration**

- **Grand Architect** - Meta-orchestrator for complex features, creates plans and delegates to specialized agents

**Tier 1: Daily Workflow (Essential)**

- **Design Token Guardian** - Enforces design system consistency, prevents hardcoded values
- **A11y Compliance Enforcer** - Validates WCAG 2.2 accessibility standards
- **Smart Test Generator** - Auto-generates tests with edge case coverage
- **Performance Budget Enforcer** - Tracks and maintains performance metrics

**Tier 2: Power Agents**

- **Performance Prophet** - Predictive performance analysis
- **Security Penetration Specialist** - Security testing against OWASP Mobile Top 10

### 3 Slash Commands

- `/feature` - Multi-agent feature implementation workflow
- `/review` - Comprehensive code review (design + accessibility + security + performance)
- `/test` - Generate test suite with edge cases

### 13 Additional Specialized Agents (Templates)

The system includes templates for creating 13 more specialized agents:

- Version Compatibility Shield
- User Journey Cartographer
- Zero-Breaking Refactor Surgeon
- Cross-Platform Harmony Enforcer
- API Contract Guardian
- Memory Leak Detective
- Design System Consistency Enforcer
- Technical Debt Quantifier
- Test Strategy Architect
- Bundle Size Assassin
- Migration Strategist
- State Management Auditor
- Feature Impact Analyzer

## Installation

### Automatic (Windows PowerShell)

**Interactive Mode**:

```powershell
cd claude-code-reactnative-expo-agent-system\scripts
.\install-agents.ps1
```

**Non-Interactive Mode**:

```powershell
# Project-scoped (team collaboration)
.\install-agents.ps1 -Scope project

# Global (personal use)
.\install-agents.ps1 -Scope global
```

### Manual Installation

**Project-Scoped**:

```bash
cp -r ready-to-use/agents/* ./.claude/agents/
cp -r ready-to-use/commands/* ./.claude/commands/
cp ready-to-use/templates/CLAUDE.md ./CLAUDE.md
```

**Global**:

```bash
cp -r ready-to-use/agents/* ~/.claude/agents/
cp -r ready-to-use/commands/* ~/.claude/commands/
cp ready-to-use/templates/settings.json ~/.claude/settings.json
```

## Usage Examples

### Automatic Agent Invocation

```
User: "Check for hardcoded colors in my components"
→ Design Token Guardian auto-invoked
```

### Explicit Agent Invocation

```
User: "@security-specialist audit the payment flow"
→ Security Specialist runs OWASP Mobile Top 10 audit
```

### Slash Commands

```
User: "/review src/screens/LoginScreen.tsx"
→ Multi-agent review (design, accessibility, security, performance)
```

### Complex Feature Planning

```
User: "I need @grand-architect to help implement offline mode"
→ Grand Architect creates plan, delegates to specialized agents
```

## Real-World Impact

Based on production usage:

**Time Savings**:

- 50% reduction in feature development time
- 80% less time on code reviews
- 60% faster test writing
- 85% reduction in design inconsistencies

**Quality Improvements**:

- 35% fewer production bugs
- 65% reduction in accessibility issues
- 80%+ test coverage achievable
- Zero breaking changes during refactoring

**Business Value**:

- Faster time to market
- Reduced support tickets
- Prevented App Store rejections
- Avoided legal issues (accessibility compliance)

## System Requirements

- **Claude Code**: v2.0.5+
- **Node.js**: 18.x or higher
- **OS**: Windows 10/11 (macOS/Linux manual installation)
- **Project**: Expo SDK 50+ or React Native 0.74+

## Repository Structure

```
claude-code-reactnative-expo-agent-system/
├── ready-to-use/
│   ├── agents/              # 20 agent configurations
│   │   ├── tier-s-meta/
│   │   ├── tier-1-daily/
│   │   ├── tier-2-power/
│   │   └── tier-3-specialized/
│   ├── commands/            # Slash commands
│   │   ├── feature.md
│   │   ├── review.md
│   │   └── test.md
│   ├── hooks/               # Automation hooks
│   └── templates/           # Project templates
│       ├── CLAUDE.md
│       └── settings.json
└── scripts/
    └── install-agents.ps1   # Windows installer
```

## Key Features

1. **Design System Enforcement** - Automatically catches hardcoded values
2. **Accessibility Compliance** - WCAG 2.2 validation before code review
3. **Security Testing** - OWASP Mobile Top 10 automated checks
4. **Performance Budgets** - Track metrics and prevent regressions
5. **Smart Test Generation** - Auto-generate tests with edge cases
6. **Multi-Agent Workflows** - Complex features broken down systematically

## When to Use

Use this agent system when:

- Building production React Native/Expo apps
- Need systematic code quality enforcement
- Want to automate accessibility compliance
- Require security testing in development
- Working in a team environment
- Shipping to App Stores (iOS/Android)

## Integration with Skills

This agent system complements the `react-native-expo` skill:

- **Skill**: Provides knowledge and patterns for React Native development
- **Agents**: Enforce best practices and automate quality checks

Use together for maximum productivity and code quality.

## Resources

- **Repository**: https://github.com/senaiverse/claude-code-reactnative-expo-agent-system
- **Quick Start Guide**: START-HERE.md in repository
- **Complete Documentation**: COMPLETE-GUIDE.md in repository
- **Agent Reference**: ready-to-use/agents/AGENTS-REFERENCE.md

## Sources

- [senaiverse/claude-code-reactnative-expo-agent-system](https://github.com/senaiverse/claude-code-reactnative-expo-agent-system)
- [Building Mobile Apps with Claude Code](https://caritos.com/posts/building-mobile-apps-with-claude-code/)
- [Expo Development Patterns](https://developertoolkit.ai/en/cookbook/mobile-development/expo/)
- [React Native Expert Skill](https://claude-plugins.dev/skills/@Jeffallan/claude-skills/react-native-expert)
- [Expo Configuration Skill](https://mcpmarket.com/tools/skills/expo-configuration)
