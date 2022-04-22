SHOW databases;

CREATE DATABASE social;

USE social;

CREATE TABLE Authentication (
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    isAdmin BOOLEAN DEFAULT 0,
    PRIMARY KEY (email)
);

INSERT INTO Authentication VALUES ("jiajun@qq.com", "1111", 0);

DROP TABLE Authentication;
DROP TABLE sessions;

SELECT * FROM Authentication;

-- ===========================================================

CREATE TABLE User_Profile (
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    birthday date,
    instagram_handle VARCHAR(255),
    facebook_handle VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    FOREIGN KEY (email) REFERENCES Authentication(email)
);

INSERT INTO User_Profile VALUES ("jiajun@qq.com", "Jiajun", "Yu", "2001-09-13", "http://insra.com", "http://twitter.com", "SA", "Australia");

SELECT * FROM User_Profile;

-- ===========================================================

CREATE TABLE Events (
    event_id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_by VARCHAR(255),
    proposal_date date,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    custom_link VARCHAR(255) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    postcode VARCHAR(255) NOT NULL,
    PRIMARY KEY (event_id),
    FOREIGN KEY (created_by) REFERENCES Authentication(email)
);

drop TABLE Events;

INSERT INTO Events (title, description, created_by, proposal_date, start_date, end_date, custom_link, address_line, state, country, postcode) VALUES ("Jason Beh's birthday", "Hello Hello !!", "jiajun@qq.com", "2023-01-18", "2023-01-18 18:30:00", "2023-01-18 21:30:00", "http://jieshenjieshen.com", "The University of Adelaide", "SA", "Australia", "5050");

SELECT * FROM Events;

-- ===========================================================

CREATE TABLE Attendance (
    email VARCHAR(255),
    event_id INT,
    FOREIGN KEY (email) REFERENCES Authentication(email),
    FOREIGN KEY (event_id) REFERENCES Events(event_id)
)

INSERT INTO Attendance VALUES ("jiajun@qq.com", 1);

SELECT * FROM Attendance;

-- ===========================================================

CREATE TABLE Availability (
    email VARCHAR(255),
    event_id INT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    FOREIGN KEY (email) REFERENCES Authentication(email),
    FOREIGN KEY (event_id) REFERENCES Events(event_id)
);

INSERT INTO Availability VALUES ("jiajun@qq.com", 1, "2023-01-18 18:30:00", "2023-01-18 21:30:00");

SELECT * FROM Availability;
