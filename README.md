# AkinX AI (protected creator info)

This project adds a password-protected reveal for the full personal creator info.

## What changed
- When someone asks who created the assistant:
  - If the request includes a valid bearer token matching `CREATOR_SECRET`, the server returns full details (DOB, parents, nationality).
  - Otherwise, it returns a redacted public message with only name & founder.

## How to set the secret (Render / Railway / Heroku)
- In your service settings, create an environment variable:
  - `CREATOR_SECRET` = a strong secret token (e.g. `my_super_secret_token_123`)
- Example of sending a protected request:
