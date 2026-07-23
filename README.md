# Archive ROM Handbook

An open-source preservation project for archiving structured information from **ROM Handbook** before the original resource becomes unavailable.

The project collects publicly accessible game-reference data, stores normalized records in SQLite, and keeps raw HTML snapshots for preservation and future reprocessing. Its long-term goal is to provide a searchable public API, a lightweight web interface, and source-grounded AI-assisted search for the community.

> This project is intended for preservation, research, and educational use. Game names, artwork, and other intellectual property belong to their respective owners.

## Why this project exists

ROM Handbook contains a large amount of community knowledge that may otherwise disappear. Archive ROM Handbook is designed to preserve that information in formats that are:

- searchable;
- machine-readable;
- reproducible;
- suitable for community tools and research;
- resilient if the original website goes offline.

## Archived data

Current crawlers cover data such as:

- equipment;
- headwear;
- cards;
- monsters;
- skills;
- mounts;
- pets;
- buffs;
- formulas;
- jobs;
- maps and other reference data as coverage expands.

For each supported category, the project may retain both normalized records and raw HTML snapshots.

## Current status

### Completed

- [x] Category-specific Python crawlers
- [x] SQLite storage
- [x] Raw HTML archival
- [x] Equipment, headwear, card, monster, skill, mount, pet, formula, and buff collection
- [x] Ongoing API development and documentation improvements

### Planned

- [ ] Stabilize and document the public API
- [ ] Build a searchable frontend
- [ ] Add source-grounded AI question answering
- [ ] Improve image delivery and caching
- [ ] Add Docker support
- [ ] Expand automated tests and security checks

## Technology

- Python
- Beautiful Soup
- Requests
- SQLite
- python-dotenv

Additional API or frontend components may be introduced as the project evolves.

## Project architecture

```text
Source pages
    │
    ▼
Python crawlers
    ├── Parse structured fields
    ├── Preserve raw HTML
    └── Normalize records
            │
            ▼
        SQLite database
            │
            ├── Public API (in progress)
            ├── Web interface (planned)
            └── AI-assisted search (planned)
```

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/FawziLinggo/archive-romhandbook.git
cd archive-romhandbook
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

Activate it:

**Windows**

```bash
venv\Scripts\activate
```

**Linux or macOS**

```bash
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a local `.env` file when required by a crawler or service. Never commit secrets, API keys, session cookies, or private endpoints.

### 5. Run a crawler

Example:

```bash
python crawler-equipment.py
```

Other crawler entry points include:

```bash
python crawler-headwears.py
python crawler-cards.py
python crawler-monsters.py
python crawler-skills.py
python crawler-mounts.py
python crawler-pets.py
python crawler-formulas.py
python crawler-buffs.py
```

Crawler names and commands may change as the project is reorganized. Check the repository root for the latest entry points.

## Data storage

Structured data is stored locally in SQLite. A typical local database file is:

```text
database.db
```

Raw HTML snapshots are retained separately where supported so parsers can be improved without repeatedly requesting the original pages.

Generated databases, downloaded assets, raw snapshots, and credentials should not be committed unless they are intentionally prepared for public distribution and legally safe to publish.

## Security

This project processes third-party web content and is developing public-facing API functionality. Security-sensitive areas include:

- validation of untrusted HTML and remote URLs;
- request timeouts, redirects, and server-side request forgery protections;
- safe file and database paths;
- SQL query parameterization;
- secret management;
- dependency vulnerabilities;
- API authentication, authorization, rate limiting, and abuse prevention;
- safe rendering of archived content in future web interfaces;
- prompt-injection resistance for future AI-assisted search.

Security reports should avoid publishing exploitable details before a fix is available. Please contact the maintainer privately when reporting a serious issue.

## Responsible crawling

Contributors should:

- respect the source website's availability and applicable policies;
- use conservative request rates;
- add timeouts and retry limits;
- avoid bypassing access controls;
- collect only data needed for preservation;
- avoid storing personal or sensitive information.

## Contributing

Pull requests and improvements are welcome.

Useful contributions include:

- parser fixes;
- additional test coverage;
- data validation;
- API documentation;
- accessibility improvements;
- performance optimization;
- security hardening;
- archival metadata and provenance tracking.

Before opening a large pull request, consider creating an issue describing the proposed change and its expected impact.

## Roadmap priorities

1. Make crawler output reproducible and testable.
2. Document the database schema and data provenance.
3. Stabilize a read-only public API.
4. Add automated dependency and security scanning.
5. Build a fast, accessible search interface.
6. Add retrieval-based AI answers with citations to archived records.

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by the owners or publishers of Ragnarok M, ROM Handbook, or related services.

The archive is provided on a best-effort basis. Data may be incomplete, outdated, or inaccurate. Users should verify important information against authoritative sources when available.

## License

A clear open-source license should be added before broad reuse or external contributions are encouraged. The maintainer should select a license that matches the intended permissions and any applicable content restrictions.
