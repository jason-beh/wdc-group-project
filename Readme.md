# Socialah

A social event planning system that allows you to create event and ask friends to fill up their availability. With their input, you get to make better decisions and increase event turnout rate!

## Team Members:

- Jiajun Yu (a1806320)
- Jie Shen Beh (a1834032)
- Hung Yee Wong (a1815836)
- Guan Chern Liew (a1837053)

## Installation

1. Download Node.js and MySQL.

2. Make sure that MySQL is running.

3. Create a database called `social` using the following commands:

```sql
CREATE DATABASE social;
USE DATABASE social;
```

4. Run the sql files in the following order:

- `deleteAll.sql` (To ensure that we create a fresh start)
- `initalize.sql` (To initialize the required tables)

One way to do it easily is to copy the contents in the respective files and pasting it in the MySQL terminal.

5. Install the Node.js dependencies:

```bash
npm install
```

6. Run the project on localhost:

```bash
npm start
```
