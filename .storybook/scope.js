const fs = require('fs');
const path = require('path');

const ACRONYM_SEGMENTS = new Set(['ui', 'api', 'db', 'qa', 'ux', 'ssr', 'csr', 'cli']);

function humanizeSegment(segment) {
  const lower = segment.toLowerCase();
  if (ACRONYM_SEGMENTS.has(lower)) {
    return lower.toUpperCase();
  }
  if (!segment.length) {
    return segment;
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function humanize(value) {
  return value
    .split(/[\\/]/)
    .map((part) =>
      part
        .split(/[-_\s]+/)
        .filter(Boolean)
        .map(humanizeSegment)
        .join(' ')
    )
    .filter(Boolean)
    .join(' / ');
}

function readJsonIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`[storybook] Failed to read ${filePath}:`, error);
  }
  return null;
}

function listChildDirectories(rootDir) {
  try {
    return fs
      .readdirSync(rootDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => ({
        dirName: entry.name,
        root: path.join(rootDir, entry.name),
      }));
  } catch (error) {
    return [];
  }
}

function buildRecords(rootDir, kind) {
  return listChildDirectories(rootDir).map((entry) => {
    const packageJsonPath = path.join(entry.root, 'package.json');
    const packageJson = readJsonIfExists(packageJsonPath);
    return {
      kind,
      dirName: entry.dirName,
      root: entry.root,
      packageJsonPath,
      packageJson,
      packageName: packageJson && packageJson.name ? packageJson.name : null,
      title: humanize(entry.dirName),
    };
  });
}

function createLookup(records) {
  const map = new Map();
  records.forEach((record) => {
    map.set(record.dirName, record);
    if (record.packageName) {
      map.set(record.packageName, record);
    }
    if (record.packageName && record.packageName.startsWith('@')) {
      const shortName = record.packageName.slice(1);
      map.set(shortName, record);
    }
  });
  return map;
}

function filterRecords(records, rawValue) {
  if (!rawValue || !rawValue.trim()) {
    return records;
  }

  const tokens = rawValue
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens.length) {
    return records;
  }

  const lowered = tokens.map((token) => token.toLowerCase());
  if (lowered.includes('none') || lowered.includes('off')) {
    return [];
  }
  if (lowered.includes('*') || lowered.includes('all')) {
    return records;
  }

  const lookup = createLookup(records);
  const includes = tokens.filter((token) => !token.startsWith('-'));
  const excludes = tokens
    .filter((token) => token.startsWith('-'))
    .map((token) => token.slice(1));

  let selected;
  if (includes.length) {
    const seen = new Set();
    selected = [];
    includes.forEach((token) => {
      const record = lookup.get(token);
      if (record && !seen.has(record.dirName)) {
        seen.add(record.dirName);
        selected.push(record);
      }
    });
  } else {
    selected = [...records];
  }

  if (excludes.length) {
    const excludeSet = new Set();
    excludes.forEach((token) => {
      const record = lookup.get(token);
      if (record) {
        excludeSet.add(record.dirName);
      }
    });
    selected = selected.filter((record) => !excludeSet.has(record.dirName));
  }

  return selected;
}

function findRecord(records, token) {
  if (!token) {
    return null;
  }
  const lookup = createLookup(records);
  return lookup.get(token) || null;
}

function resolveScope() {
  const rootDir = path.resolve(__dirname, '..');
  const packagesRoot = path.join(rootDir, 'packages');
  const appsRoot = path.join(rootDir, 'apps');

  const allPackages = buildRecords(packagesRoot, 'package');
  const allApps = buildRecords(appsRoot, 'app');

  const selectedPackages = filterRecords(allPackages, process.env.STORYBOOK_PACKAGES);
  const selectedApps = filterRecords(allApps, process.env.STORYBOOK_APPS);

  const primaryToken = process.env.STORYBOOK_PRIMARY_APP;
  const primaryApp = primaryToken ? findRecord(allApps, primaryToken) : selectedApps[0] || null;

  return {
    rootDir,
    packagesRoot,
    appsRoot,
    allPackages,
    allApps,
    selectedPackages,
    selectedApps,
    primaryApp,
  };
}

module.exports = {
  resolveScope,
  humanize,
  listChildDirectories,
  filterRecords,
};
