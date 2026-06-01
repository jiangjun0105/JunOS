# JunOS task runner — run `just` to see available commands.

# Show available recipes
default:
    @just --list

# Stop whatever is listening on port 4173 (graceful TERM, then force KILL)
stop:
    #!/usr/bin/env sh
    # lsof is unreliable on this host, so resolve PIDs via ss, falling back to fuser
    get_pids() {
        pids=$(ss -ltnp "sport = :4173" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u)
        [ -z "$pids" ] && pids=$(fuser 4173/tcp 2>/dev/null)
        echo $pids
    }
    pids=$(get_pids)
    if [ -z "$pids" ]; then
        echo "✓ Port 4173 is already free"
        exit 0
    fi
    echo "→ Stopping process(es) on :4173: $pids"
    kill $pids 2>/dev/null || true
    # wait up to 5s for a graceful exit
    for _ in 1 2 3 4 5; do
        sleep 1
        [ -z "$(get_pids)" ] && break
    done
    remaining=$(get_pids)
    if [ -n "$remaining" ]; then
        echo "→ Force-killing: $remaining"
        kill -9 $remaining 2>/dev/null || true
    fi
    echo "✓ Port 4173 freed"

# Restart the dev server on port 4173 (stops any existing one first)
start: stop
    @echo "→ Starting dev server on :4173"
    pnpm dev --port 4173
