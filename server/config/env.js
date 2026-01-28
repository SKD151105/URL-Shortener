// env Validation (Optional but good practice) --> Validating required env vars at startup
const required = ["MONGODB_URI", "REDIS_URL"];

export function validateEnv() {
	required.forEach((key) => {
		if (!process.env[key]) {
			throw new Error(`${key} missing`);
		}
	});
}