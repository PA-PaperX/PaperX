// Reactive registry of every swarm part that has finished building.
// Ensures that collapsing & re-expanding panels (Explorer sidebar, PaperX folder, P5X Bio HiDE/+Show)
// never loses its built state or disappears back to opacity: 0.
const state = $state<{ built: Record<string, boolean> }>({
	built: {}
});

export function markPartBuilt(partId: string | null | undefined) {
	if (!partId) return;
	state.built[partId] = true;
}

export function isPartBuilt(partId: string): boolean {
	return Boolean(state.built[partId]);
}

export function resetBuiltState() {
	state.built = {};
}
