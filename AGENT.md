# GameHub Agent Instructions

## Project purpose

GameHub is a browser-based game hub. Games are opened in the browser without a local installation. The public main site is:

- https://gamehubjogos.github.io/

The public GitHub Pages repository for that site is:

- https://github.com/gamehubjogos/gamehubjogos.github.io

The historical/original source repository remains the place where commits are made:

- https://github.com/Igu2012/GameHub

## Publishing workflow

1. Make and test changes in the local checkout of `Igu2012/GameHub`.
2. Commit changes to the original repository with an **English commit message**.
3. Push the commit to the original repository.
4. Open the fork `gamehubjogos/gamehubjogos.github.io` on GitHub.
5. Use the fork's **Sync fork / Sync commits** button to bring the original repository's commit into the GitHub Pages fork.
6. Wait for GitHub Pages to deploy and verify the public site at `https://gamehubjogos.github.io/`.

Do not put access tokens, API keys, passwords, cookies, or other secrets in this repository, commit messages, documentation, game files, or URLs.

## Where to publish game files

Game files are hosted in the separate public asset repositories under the `gamehubjogosfiles` organization:

- `https://github.com/gamehubjogosfiles/gamefiles01`
- `https://github.com/gamehubjogosfiles/gamefiles02`
- `https://github.com/gamehubjogosfiles/gamefiles03`

The GameHub catalog and UI live in this repository. Each game entry in `games.json` must have a `Link` matching its folder name in the selected gamefiles repository and an `ImageURL` that is either a local `img/` asset or a self-hosted asset path.

The asset routing table is in `asset-host.js`. It maps game keys to `gamefiles01`, `gamefiles02`, or `gamefiles03` and selects the provider based on the current host:

- `gamehubjogos.github.io` uses the GitHub Pages gamefiles hosts.
- Vercel uses the Vercel gamefiles hosts.
- Render uses Render when healthy and falls back to Vercel.

When adding or moving a game, update both the gamefiles repository and the `repositoryByGame` mapping in `asset-host.js` when the default mapping is not `gamefiles03`.

## Catalog conventions

- Edit `games.json` under the appropriate category.
- Use the display name in `Name`.
- Use the folder/card path in `ImageURL`.
- Use the folder path with a trailing slash in `Link`.
- Set `MobileFriendly` accurately. Desktop-heavy Unity, WASM, and keyboard games normally use `false`.
- Set `Orientation` to `landscape` unless the game is designed for portrait mode.
- Use `Favicon` only when the game needs a self-hosted custom favicon.
- Keep game assets self-hosted in the gamefiles repository whenever possible.

## Large assets and loading

Files that are too large for the hosting workflow should be split into sequential chunks such as `Build.data.part01`, `Build.data.part02`, and so on. The game's local `index.html` must reassemble the chunks before the runtime requests the original filename. Verify the byte-for-byte hash after reassembly.

The GameHub player provides a default outer loading state for games whose embedded boot screen is slow, blank, inconsistent, or visually incompatible. Do not remove a working game's own loader unless testing proves it is broken. For custom loaders, keep the loading assets local to the game folder and make sure the iframe sends the standard GameHub ready/error message when applicable.

The shared loading styles are in `gamehub-loading-theme.css`. The outer player loading state is implemented in `play.html` and `play.js` and should remain usable for every game, including games that do not provide a custom loading screen.

## Sitemap and URLs

The GitHub Pages sitemap is `sitemap_github.xml` and uses:

- `https://gamehubjogos.github.io`

The sitemap generator is `generate_sitemap.py`. If the catalog changes, regenerate the sitemap and keep `robots.txt` pointing to the GitHub Pages sitemap.

## Testing checklist

- Check the catalog entry and its category.
- Check the card image and favicon paths.
- Open the game through `play.html?game=<GameKey>`.
- Confirm that the game files are loaded from the selected gamefiles host.
- Confirm that no unintended external asset URLs are used.
- Test desktop and, when `MobileFriendly` is true, mobile behavior.
- For large builds, verify all chunks exist and reassemble in the browser.
- Use English commit messages and keep the working tree clean before pushing.
