# PocketBase Integration Setup

## PocketBase Collections

You need to manually create the following collection in your PocketBase admin panel:

### Collection: `receipts`

**Create Settings:**

- Collection name: `receipts`
- Type: Base

**Fields:**
| Field | Type | Options |
|-------|------|---------|
| `user` | Relation | Single, Required, Collection: `users` |
| `title` | Text | Required, Min: 1, Max: 255 |
| `items` | JSON | Required |
| `people` | JSON | Required |
| `tax` | Number | Required |
| `tip` | Number | Required |
| `tip_as_proportion` | Bool | Required, Default: `true` |
| `tip_the_tax` | Bool | Required, Default: `false` |
| `created` | Autodate | Create |
| `updated` | Autodate | Update |

**API Rules:**

```
List:   @request.auth.id != "" && user = @request.auth.id
View:   @request.auth.id != "" && user = @request.auth.id
Create: @request.auth.id != ""
Update: @request.auth.id != "" && user = @request.auth.id
Delete: @request.auth.id != "" && user = @request.auth.id
```

### Collection: `users` (built-in)

The built-in `users` collection handles authentication. Ensure these settings:

**Options:**

- ✅ Allow users to login with email/password
- ✅ Minimum password length: 8

**Fields to add:**
| Field | Type | Options |
|-------|------|---------|
| `name` | Text | Optional |

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required variables:**

- `NEXT_PUBLIC_POCKETBASE_URL` - Your PocketBase instance URL (default: http://127.0.0.1:8090)
- `OPENROUTER_API_KEY` - For AI receipt parsing (already configured)

## Running PocketBase Locally

1. Download PocketBase from https://pocketbase.io/
2. Extract and run: `./pocketbase serve`
3. Create an admin account at http://127.0.0.1:8090/_/
4. Create the `receipts` collection with the schema above
5. Enable email/password auth in the settings

## Features

Once configured, your app will have:

- **User Authentication**: Login/register with email/password
- **Cloud Save**: Save receipts to your account
- **Receipt History**: View and load previously saved receipts
- **Secure**: All data is scoped to the authenticated user

## Architecture

This implementation uses a **client-side only** architecture as recommended by the PocketBase maintainer:

- No server-side PocketBase code
- Direct browser-to-PocketBase communication
- Auth state persisted in localStorage
- No SSR complications or security vulnerabilities
