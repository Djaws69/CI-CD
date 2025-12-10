#!/usr/bin/env node

const fs = require('fs');

if (process.argv.length < 4) {
  console.error('Usage: node npm-audit-diff.js <baseline.json> <current.json>');
  process.exit(1);
}

const baselinePath = process.argv[2];
const currentPath = process.argv[3];

const baselineRaw = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const currentRaw = JSON.parse(fs.readFileSync(currentPath, 'utf8'));

// Support npm v6 (advisories) et npm v7+ (vulnerabilities)
function extractIssues(report) {
  const issues = [];

  // npm v7+ : report.vulnerabilities
  if (report.vulnerabilities) {
    for (const [pkg, vul] of Object.entries(report.vulnerabilities)) {
      const severity = vul.severity || 'info';

      for (const via of vul.via || []) {
        if (typeof via === 'string') {
          issues.push({
            id: `${pkg}:${via}`,
            pkg,
            viaName: via,
            severity,
          });
        } else {
          issues.push({
            id: `${pkg}:${via.title || via.name || via.source || 'unknown'}`,
            pkg,
            viaName: via.title || via.name || via.source || 'unknown',
            severity,
          });
        }
      }
    }
  }

  // npm v6 : report.advisories
  if (report.advisories) {
    for (const [id, adv] of Object.entries(report.advisories)) {
      issues.push({
        id: `adv-${id}:${adv.module_name}`,
        pkg: adv.module_name,
        viaName: adv.title,
        severity: adv.severity || 'info',
      });
    }
  }

  return issues;
}

function severityRank(sev) {
  switch (sev) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'moderate': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

// Niveau minimum bloquant
const MIN_SEVERITY = 'high';
const MIN_RANK = severityRank(MIN_SEVERITY);

const baselineIssues = extractIssues(baselineRaw);
const currentIssues = extractIssues(currentRaw);

// Vulnérabilités déjà présentes dans la baseline
const baselineSet = new Set(baselineIssues.map(i => i.id));

// Vulnérabilités présentes dans current mais pas dans baseline
const newIssues = currentIssues.filter(i => !baselineSet.has(i.id));

// Sélection des vulnérabilités bloquantes
const blockingNewIssues = newIssues.filter(i => severityRank(i.severity) >= MIN_RANK);

if (blockingNewIssues.length === 0) {
  console.log('Aucun nouveau problème npm audit de sévérité >=', MIN_SEVERITY);
  process.exit(0);
}

console.log(`${blockingNewIssues.length} nouvelle(s) vulnérabilité(s) npm audit de sévérité >= ${MIN_SEVERITY}:`);
for (const issue of blockingNewIssues) {
  console.log(`- [${issue.severity}] ${issue.pkg} – ${issue.viaName} (id: ${issue.id})`);
}

process.exit(1);
