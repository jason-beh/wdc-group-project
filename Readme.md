![Main Image](./public/repo/main-image.png)

# Socialah

A social event planning system that allows you to create events and ask friends to fill up their availability. With their input, you get to make better decisions and increase event turnout rate!

## Features

There are three types of users in Socialah:

1. Unauthenticated users
2. Logged In users
3. Admins

| Feature                    | Unauthenticated User | Logged In Users | Admin |
| -------------------------- | -------------------- | --------------- | ----- |
| Sign Up                    | ✅                   | ✅              | ✅    |
| Verify Email               | ✅                   | ✅              | ✅    |
| Login                      | ✅                   | ✅              | ✅    |
| Logout                     | ✅                   | ✅              | ✅    |
| Google OAuth               | ✅                   | ✅              | ✅    |
| Forget Password            | ✅                   | ✅              | ✅    |
| Event List                 | ✅                   | ✅              | ✅    |
| Event Details              | ✅                   | ✅              | ✅    |
| Search Event               | ✅                   | ✅              | ✅    |
| Specify Availability       | ✅                   | ✅              | ✅    |
| Sync Google Calendar       | ✅                   | ✅              | ✅    |
| Confirm Attendance         | ✅                   | ✅              | ✅    |
| Create Event               | ❌                   | ✅              | ✅    |
| Edit Event                 | ❌                   | ✅              | ✅    |
| Delete Event               | ❌                   | ✅              | ✅    |
| Edit Profile               | ❌                   | ✅              | ✅    |
| Settings                   | ❌                   | ✅              | ✅    |
| Admin Dashboard            | ❌                   | ❌              | ✅    |
| Create User                | ❌                   | ❌              | ✅    |
| Edit Other Users' Profile  | ❌                   | ❌              | ✅    |
| Delete User                | ❌                   | ❌              | ✅    |
| Create System Admin        | ❌                   | ❌              | ✅    |
| Edit Other Users' Events   | ❌                   | ❌              | ✅    |
| Delete Other Users' Events | ❌                   | ❌              | ✅    |

## Team Members:

- Jiajun Yu (a1806320)
- Jie Shen Beh (a1834032)
- Hung Yee Wong (a1815836)
- Guan Chern Liew (a1837053)

## Installation

0. (Optional) - Use our dedicated github account to ensure that you can use our Client ID and Google Calendar API key.

See Troubleshooting Section 4 for more info.

1. Download Node.js and MySQL.

2. Make sure that MySQL is running.

If you are using VSCode for CS50, this can be done using `sql_start`.

3. Run the following command in the project folder to seed some data:

`mysql --host=127.0.0.1 < sql/seed.sql`

One way to do it easily is to copy the contents in the respective files and pasting it in the MySQL terminal.

If you want a blank database with tables, consider using `initialize.sql`

4. Install the Node.js dependencies:

```bash
npm install
```

5. Run the project on localhost:

```bash
npm start
```

Note: Do not use public port in VSCode for CS50. It will work normally in http://localhost:3000

## Seed Data Authentication

```text
admin:
    user: admin1@gmail.com
    pass: Admin@123

user1:
    user: user_1@gmail.com
    pass: User!321

user2:
    user: user_2@gmail.com
    pass: User2Nice^
```

## Nodemailer Authentication

For email, we are currently using ethereal for testing. You can visit the URL at [Ethereal](https://ethereal.email/login)

```text
user: "hy7tjayeu3f3ganq@ethereal.email",
pass: "kGSvXP3g4974KTHGgW",
```

## Troubleshooting

1. I encountered a 500 error of `Internal Server Error` in Visual Studio code for CS50 during signup, how do I fix it?
   The error is most likely due to MySQL Auth Mode error. Consider running these commands to solve the issue:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
flush privileges;
```

StackOverflow reference link to the solution: https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server

For VSCode for CS50, you can `sql_reset` or rebuild the codespace.

2. What does each SQL file do?

In the `/sql` folder, we have 3 files:

- `initialize.sql` to create all tables with NO data
- `seed.sql` to create all tables with some mock data
- `deleteAll.sql` to delete all tables

3. What should I do if I encounter Iframe Google API issue in Developer Tools?

You can use our dedicated github account.

```text
Github Login
username: wdc-socialah
password: wdc2022sem2
```

4. What should I do if I encounter SQL issues eg. TypeError: Cannot read properties of undefined (reading 'release')?

The options in `db.js` must NOT HAVE the property user and password. After editing, it should look like this:

```javascript
var options = {
  host: "localhost",
  database: "social",
};
```

5. What should I do if I face an error: Error: ER_ACCESS_DENIED_ERROR: Access denied for user ''@'localhost' (using password: NO)?

The options in `db.js` must HAVE the property user and password. After editing, it should look like this:

```javascript
var options = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "social",
};
```

6. Everything is not working, what should I do?

- Refresh the page
- Make sure the project is ran in http://localhost:3000 (Using private port)
- In the worst case, reach out to anyone in the team members/collaborators list. Our phone numbers are:

  - \* Jie Shen Beh - 0466121563
  - Jiajun Yu - 0466659310
  - Hung Yee Wong - 0432677520
  - Guan Chern Liew - 0422626373
