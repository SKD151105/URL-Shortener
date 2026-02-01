export function validateUrl(value) {
	if (typeof value !== "string") {
		return false;
	}

	const trimmed = value.trim();
	if (!trimmed) {
		return false;
	}

	try {
		const parsed = new URL(trimmed);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}