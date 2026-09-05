/**
 * Builds the ElevenLabs upload bundle for the "Call Me" agent from the knowledge
 * base, per kb/HANDOFF.md §4.
 *
 * Inputs (kb/ is the source of truth and is never modified):
 *   kb/refined/**\/*.md      every refined file, INDEX files included
 *   kb/agent/persona.md      how the agent speaks as Jun
 *   kb/agent/faq.md          likely visitor questions, in Jun's words
 *   kb/agent/system-prompt.md
 *
 * Outputs (dist/agent-kb/, gitignored — regenerate rather than commit):
 *   system-prompt.md         the prompt WITHOUT the "ElevenLabs setup" section,
 *                            which is Jun's checklist, not part of the prompt
 *   knowledge-base.md        one file, every source concatenated under a
 *                            `# <path>` header with YAML frontmatter stripped —
 *                            for the single-file upload path
 *   files/<flat-name>.md     the same sources as separate documents, frontmatter
 *                            stripped, for uploading one document per topic
 *
 * kb/raw/ (verbatim transcripts), kb/HANDOFF.md and kb/README.md are excluded by
 * construction: raw is provenance and must never reach the agent.
 *
 *   node scripts/build-agent-bundle.mjs
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const OUT = join(ROOT, 'dist/agent-kb')

/** Every .md under `dir`, depth-first, sorted so the bundle is reproducible. */
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.md') ? [join(dir, e.name)] : [],
    )
}

/** Drop a leading `---\n…\n---` YAML block; the agent should read prose only. */
function stripFrontmatter(text) {
  return text.startsWith('---\n') ? text.replace(/^---\n[\s\S]*?\n---\n*/, '') : text
}

const sources = [
  ...walk(join(ROOT, 'kb/refined')),
  join(ROOT, 'kb/agent/persona.md'),
  join(ROOT, 'kb/agent/faq.md'),
]

rmSync(OUT, { recursive: true, force: true })
mkdirSync(join(OUT, 'files'), { recursive: true })

// The system prompt: frontmatter (internal metadata, not instructions) and
// Jun's own setup checklist at the bottom both stripped, so what's left is
// exactly what the agent should be given.
const prompt = stripFrontmatter(readFileSync(join(ROOT, 'kb/agent/system-prompt.md'), 'utf8'))
const setupHeading = prompt.indexOf('\n# ElevenLabs setup')
writeFileSync(
  join(OUT, 'system-prompt.md'),
  (setupHeading === -1 ? prompt : prompt.slice(0, setupHeading))
    // the checklist is preceded by a `---` rule; drop that too
    .replace(/\n+---\s*$/, '\n')
    .trim() + '\n',
)

const chunks = []
for (const file of sources) {
  const path = relative(ROOT, file)
  const body = stripFrontmatter(readFileSync(file, 'utf8')).trim()
  chunks.push(`# ${path}\n\n${body}\n`)
  writeFileSync(join(OUT, 'files', path.replace(/^kb\//, '').replaceAll('/', '__')), `${body}\n`)
}
writeFileSync(join(OUT, 'knowledge-base.md'), chunks.join('\n\n'))

console.log(`${sources.length} source files → ${relative(ROOT, OUT)}/`)
console.log('  system-prompt.md    (prompt only, setup checklist removed)')
console.log('  knowledge-base.md   (single-file upload)')
console.log('  files/              (one document per source)')
