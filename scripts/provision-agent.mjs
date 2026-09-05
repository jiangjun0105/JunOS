/**
 * Creates (or updates) the ElevenLabs "Call Me" agent from the knowledge base.
 *
 * Run `node scripts/build-agent-bundle.mjs` first — this script uploads what
 * that produced. Both are re-runnable: edit `kb/refined/`, rebuild, re-run, and
 * the agent's knowledge base and system prompt match the KB again.
 *
 *   node --env-file=.env scripts/provision-agent.mjs [--dry-run]
 *
 * Needs ELEVENLABS_API_KEY. If NEXT_PUBLIC_ELEVENLABS_AGENT_ID is set, that
 * agent is UPDATED in place (so the id on the deployed site keeps working);
 * otherwise a new agent is created and the id is printed to add to .env.
 *
 * Knowledge-base documents are namespaced with a `junos/` prefix and every
 * prefixed document is replaced on each run, so deleting a file in kb/refined/
 * actually removes it from the agent instead of leaving an orphan behind.
 * Documents outside the prefix — anything Jun uploaded by hand — are untouched.
 *
 * kb/raw/ never reaches this script: the bundle builder excludes it.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, basename } from 'node:path'

const API = 'https://api.elevenlabs.io'
const KEY = process.env.ELEVENLABS_API_KEY
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || null
const DRY = process.argv.includes('--dry-run')

/** Namespace for documents this script owns. */
const PREFIX = 'junos/'
const AGENT_NAME = 'AI Jun — junbot.dev'

const ROOT = new URL('..', import.meta.url).pathname
const BUNDLE = join(ROOT, 'dist/agent-kb')

if (!KEY) throw new Error('ELEVENLABS_API_KEY is not set (run with --env-file=.env)')
if (!existsSync(BUNDLE)) throw new Error('dist/agent-kb missing — run scripts/build-agent-bundle.mjs first')

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'xi-api-key': KEY, ...(init.headers ?? {}) },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`${init.method ?? 'GET'} ${path} → ${res.status}\n${text}`)
  return text ? JSON.parse(text) : null
}

/** `junos/refined/thoughts/bottom-up.md` from the flattened bundle filename. */
function docName(file) {
  return PREFIX + basename(file).replaceAll('__', '/')
}

// ── 1. replace the documents this script owns ────────────────────────────────
const existing = (await api('/v1/convai/knowledge-base?page_size=100')).documents
const owned = existing.filter((d) => d.name.startsWith(PREFIX))
console.log(`knowledge base: ${existing.length} documents, ${owned.length} owned by this script`)

if (!DRY) {
  for (const doc of owned) {
    await api(`/v1/convai/knowledge-base/${doc.id}?force=true`, { method: 'DELETE' })
  }
  if (owned.length) console.log(`  deleted ${owned.length} stale documents`)
}

const files = readdirSync(join(BUNDLE, 'files')).sort()
const knowledgeBase = []
for (const file of files) {
  const name = docName(file)
  if (DRY) {
    knowledgeBase.push({ type: 'file', name, id: '(dry-run)', usage_mode: 'auto' })
    continue
  }
  const form = new FormData()
  const body = readFileSync(join(BUNDLE, 'files', file))
  form.append('file', new Blob([body], { type: 'text/markdown' }), basename(file))
  form.append('name', name)
  const { id } = await api('/v1/convai/knowledge-base/file', { method: 'POST', body: form })
  knowledgeBase.push({ type: 'file', name, id, usage_mode: 'auto' })
  process.stdout.write('.')
}
console.log(`\n  uploaded ${knowledgeBase.length} documents`)

// ── 2. the agent ─────────────────────────────────────────────────────────────
const prompt = readFileSync(join(BUNDLE, 'system-prompt.md'), 'utf8')

const conversation_config = {
  agent: {
    first_message: "Hey — I'm Jun's digital twin. What brought you to the site?",
    language: 'en',
    prompt: {
      prompt,
      // A persona with hard "never invent a fact" guardrails and a three-sentence
      // turn limit needs a capable model; downgrade in the dashboard if the LLM
      // spend matters more than fidelity.
      llm: 'claude-sonnet-4-5',
      temperature: 0.4,
      knowledge_base: knowledgeBase,
      // No custom tools by design (kb/agent/system-prompt.md): the agent ends the
      // call itself, stays silent while the visitor types, and follows the
      // visitor into Chinese or Japanese.
      built_in_tools: {
        end_call: { name: 'end_call', params: { system_tool_type: 'end_call' } },
        skip_turn: { name: 'skip_turn', params: { system_tool_type: 'skip_turn' } },
        language_detection: {
          name: 'language_detection',
          params: { system_tool_type: 'language_detection' },
        },
      },
    },
    // The prompt ends with a {{call_context}} placeholder. The site's widget
    // passes no dynamic variables, so give it a default: without one, every
    // conversation fails to start on an unresolved variable.
    dynamic_variables: {
      dynamic_variable_placeholders: {
        call_context: 'The visitor opened the Call Me window on junbot.dev.',
      },
    },
  },
}

/**
 * Post-call analysis, per kb/agent/system-prompt.md's setup checklist. The
 * platform extracts these from the transcript after every call and shows them in
 * the conversation history — which is how Jun sees who called and why, with no
 * webhook receiver to run.
 */
const platform_settings = {
  data_collection: {
    visitor_name: {
      type: 'string',
      description: "The visitor's name if they gave one; otherwise empty.",
    },
    visitor_email: {
      type: 'string',
      description:
        'An email address the visitor typed or spoke. Return it exactly as given; empty if none.',
    },
    wants_contact: {
      type: 'boolean',
      description:
        'True if the visitor asked to reach Jun, collaborate, hire, discuss research, or invite him to speak.',
    },
    intent: {
      type: 'string',
      description: 'One of: collaborate, hire, research, speak, curious, other.',
    },
    context: {
      type: 'string',
      description: 'One sentence: what the visitor wanted to talk to Jun about, in their words.',
    },
    topics: {
      type: 'string',
      description:
        'Comma-separated site topics discussed: harness, research, books, thoughts, about.',
    },
  },
  // Tuning signals, not gates — the two failure modes the prompt works hardest
  // to prevent.
  evaluation: {
    criteria: [
      {
        id: 'no_invented_facts',
        name: 'No invented facts',
        type: 'prompt',
        conversation_goal_prompt:
          'Did the agent avoid stating any fact, number, date, name or result that is not in its knowledge base? Answer failure if it invented anything, or if it named the stealth voice-AI startup.',
        use_knowledge_base: true,
      },
      {
        id: 'short_turns',
        name: 'Turns stayed short',
        type: 'prompt',
        conversation_goal_prompt:
          'Did the agent keep almost every turn to three sentences or fewer, and ask at most one question per turn?',
        use_knowledge_base: false,
      },
    ],
  },
  // The widget is embedded in a page the visitor already trusts, so no auth
  // gate; the colors are the JunOS theme tokens (src/styles/theme.css) so the
  // floating widget doesn't clash with the desktop behind it.
  auth: { enable_auth: false },
  widget: {
    variant: 'full',
    placement: 'bottom-right',
    bg_color: '#FFFBF0',
    text_color: '#25323F',
    btn_color: '#3B72C4',
    btn_text_color: '#FFFBF0',
    border_color: '#25323F',
    focus_color: '#3B72C4',
    avatar: { type: 'orb', color_1: '#3B72C4', color_2: '#4F8D5B' },
    start_call_text: 'Call AI Jun',
    listening_text: 'Listening',
    speaking_text: 'Jun is talking',
  },
}

const payload = { name: AGENT_NAME, conversation_config, platform_settings }

if (DRY) {
  console.log(JSON.stringify(payload, null, 2).slice(0, 1200))
  console.log('\n(dry run — nothing written)')
  process.exit(0)
}

let agentId = AGENT_ID
if (agentId) {
  await api(`/v1/convai/agents/${agentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  console.log(`agent updated: ${agentId}`)
} else {
  const created = await api('/v1/convai/agents/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  agentId = created.agent_id
  console.log(`agent created: ${agentId}`)
  console.log('\nAdd this to .env (and to the deploy environment):')
  console.log(`  NEXT_PUBLIC_ELEVENLABS_AGENT_ID=${agentId}`)
}
