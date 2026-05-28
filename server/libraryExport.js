const YAML_QUOTE_TRIGGER = /[:"\\\n]|^-|^\s|\s$/

function yamlString(value) {
  const str = String(value ?? '')
  if (str === '') return '""'
  if (!YAML_QUOTE_TRIGGER.test(str)) return str
  return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

export function formatFrontMatter(doc, projectSlug) {
  const tags = Array.isArray(doc.tags) ? doc.tags : []
  const tagsBlock = tags.length === 0
    ? 'tags: []'
    : `tags:\n${tags.map(tag => `  - ${yamlString(tag)}`).join('\n')}`
  const slug = projectSlug && String(projectSlug).trim() ? String(projectSlug) : 'unknown'

  return [
    '---',
    `title: ${yamlString(doc.title || '')}`,
    `type: ${doc.documentType || 'note'}`,
    `project: ${slug}`,
    tagsBlock,
    `created_at: ${doc.createdAt || ''}`,
    `updated_at: ${doc.updatedAt || ''}`,
    '---',
    '',
  ].join('\n')
}

export function renderDocumentMarkdown(doc, projectSlug) {
  const frontMatter = formatFrontMatter(doc, projectSlug)
  const body = String(doc.body ?? '')
  const bodyWithNewline = body.endsWith('\n') ? body : `${body}\n`
  return `${frontMatter}\n${bodyWithNewline}`
}

function basename(value) {
  return String(value || '').split(/[\\/]/).pop() || ''
}

function stripLeadingDots(value) {
  return value.replace(/^\.+/, '')
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function documentFilename(doc) {
  const raw = stripLeadingDots(basename(doc?.sourceFilename || '').trim())
  if (raw) {
    return /\.md$/i.test(raw) ? raw : `${raw}.md`
  }
  const slug = slugify(doc?.title || '')
  return slug ? `${slug}.md` : 'untitled.md'
}

export function dedupeFilenames(entries) {
  const counts = new Map()
  for (const entry of entries) {
    const key = `${entry.path}${entry.filename}`
    const n = counts.get(key) || 0
    counts.set(key, n + 1)
    if (n > 0) {
      const ext = entry.filename.match(/\.md$/i)?.[0] || ''
      const stem = entry.filename.slice(0, entry.filename.length - ext.length)
      entry.filename = `${stem}-${n + 1}${ext}`
    }
  }
}

export function libraryArchiveFilename(scope, date = new Date()) {
  const safe = String(scope || 'all')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'all'
  const day = date.toISOString().slice(0, 10)
  return `moomora-console-library-${safe}-${day}.zip`
}
