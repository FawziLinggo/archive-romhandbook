# Let's be friends in ROMC SEA!

My UID: `5310144193`  
See you in Rune Midgard ⚔️

---

# Archive ROM Handbook

ROM Handbook, one of the most valuable community resources for Ragnarok Online M: Classic (ROMC), is scheduled to shut down.  
This project was created to preserve as much information as possible before the website goes offline.

The crawler extracts and stores data from ROM Handbook into a local SQLite database, including:

- Equipments
- Headwears
- Cards
- Skills
- Monsters
- Mounts
- Pets
- Buffs
- Formulas
- Jobs
- And more...

In addition to structured data, the crawler also stores raw HTML snapshots for archival and future parsing purposes.

The goal of this project is to ensure that the ROMC community (I don't play ROM by the way) can continue accessing this valuable knowledge even after the original website is no longer available.

![ROM Handbook Shutdown Statement](assets/img/docs/statement.png)

---

# Project Status

## Current Progress

- [x] Equipment crawler
- [x] Headwear crawler
- [x] Card crawler
- [x] Monster crawler
- [x] Skill crawler
- [x] Mount crawler
- [x] Pet crawler
- [x] Formula crawler
- [x] Buff crawler
- [x] SQLite integration
- [x] Raw HTML archival
- [ ] Build public API
- [ ] Build frontend UI
- [ ] Create AI assistant for Q&A
- [ ] Image CDN optimization
- [ ] Docker support

---

# Tech Stack

- Python
- BeautifulSoup4
- SQLite
- Requests
- dotenv

---

# Setup

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / MacOS

```bash
source venv/bin/activate
```

---

# Install Dependencies

```bash
pip install -r requirements.txt
```

---

# Run Crawlers

Example:

```bash
python crawler-equipment.py
```

Other crawlers:

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

---

# Database

All crawled data is stored locally using SQLite.

Example database file:

```text
database.db
```

---

# Disclaimer

This project is intended for preservation and educational purposes only.

All game assets, names, and related intellectual property belong to their respective owners.

---

# Contribution

Pull requests and improvements are welcome.

If you want to help preserve ROM Handbook data, feel free to contribute.