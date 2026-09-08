import { hash } from "@node-rs/argon2";

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npm run auth:hash -- "password"');
    process.exit(1);
  }

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
    outputLen: 32,
  });

  console.log(passwordHash);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
