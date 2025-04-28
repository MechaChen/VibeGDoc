# version-service

To install dependencies:

```bash
bun install
```

To run:

```bash
bun index
```

This project was created using `bun init` in bun v1.2.7. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

&nbsp;

## Updating Prisma Schema

To update the Prisma schema, follow these steps:

1. **Modify the schema.prisma file**  
   - Open `prisma/schema.prisma` and update your table structure (e.g., add columns, modify types, add relations).

2. **Generate a migration**  
   ```bash
   bunx prisma migrate dev --name your_migration_name
   ```
   - This will:
     - Create a new migration file in `prisma/migrations`.
     - Apply the migration to your database.
     - Update your Prisma Client.

3. **Update Prisma Client (without modifying the database)**  
   ```bash
   bunx prisma generate
   ```
   - This only regenerates the Prisma Client without affecting the database.

4. **In production**  
   ```bash
   bunx prisma migrate deploy
   ```
   - This applies all pending migrations without generating new ones.

### Notes
- Always run `generate` after modifying the schema to ensure TypeScript types are up to date.
- Be cautious with migrations if your database contains data to avoid data loss.
- Use `--create-only` to generate a migration file without applying it:
  ```bash
  bunx prisma migrate dev --create-only
  ```
