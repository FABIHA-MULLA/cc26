# unicorn19

A plain HTML and JavaScript page backed by a Netlify Database (managed Postgres). Visitors can list, add and delete items.

## API endpoints

All endpoints are served by the Netlify Function in `netlify/functions/items.ts` and return JSON.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/items` | Lists all items, newest first. |
| `POST` | `/api/items` | Adds an item. Body: `{ "name": "Milk" }`. Returns the new item with status `201`, or `400` if the name is blank. |
| `DELETE` | `/api/items/:id` | Removes the item with that id (`/api/items?id=1` also works). Returns the deleted item, `400` for an invalid id, or `404` if it doesn't exist. |

| `POST` | `/api/sync` | Adds an item for server-to-server use. Requires an `x-api-token` header matching the `API_TOKEN` environment variable. Body: `{ "name": "Milk" }`. Returns the new item with status `200`, `401` if the token is missing or wrong, or `400` if the name is blank. |

Each item looks like `{ "id": 1, "name": "Milk", "createdAt": "2026-10-01T07:20:00.000Z" }`.

`API_TOKEN` is set in the Netlify environment variables and is only read on the server. It is never sent to the browser or written to logs.

## Database and deploying schema changes

The schema is defined with Drizzle ORM in `db/schema.ts`. Migration files live in `netlify/database/migrations/` and are committed to the repo like any other code.

To change the database:

1. Edit `db/schema.ts`.
2. Run `npx drizzle-kit generate --name <short_description>` to create a new migration.
3. Commit the schema and the new migration, then push to GitHub.

Netlify applies pending migrations automatically during each deploy. On production deploys they run just before the deploy is published, and a failed migration blocks publishing. Deploy previews get their own copy of the database, so preview changes never touch production data. Never edit a migration that has already been applied; add a new one instead.
