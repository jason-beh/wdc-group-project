CREATE TABLE Authentication (
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    isAdmin BOOLEAN DEFAULT 0,
    PRIMARY KEY (email)
);

CREATE TABLE sessions (
  session_id varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  expires int unsigned NOT NULL,
  data mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE User_Profile (
    email VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    birthday date,
    instagram_handle VARCHAR(255),
    facebook_handle VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    postcode VARCHAR(255),
    profile_picture VARCHAR(255),
    PRIMARY KEY(email),
    FOREIGN KEY (email) REFERENCES Authentication(email)
);

CREATE TABLE Events (
    event_id INT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_by VARCHAR(255),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    custom_link VARCHAR(255) NOT NULL,
    street_number VARCHAR(255) NOT NULL,
    street_name VARCHAR(255) NOT NULL,
    suburb VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    postcode VARCHAR(255) NOT NULL,
    event_picture VARCHAR(255),
    PRIMARY KEY (event_id),
    FOREIGN KEY (created_by) REFERENCES Authentication(email)
);

CREATE TABLE Attendance (
    email VARCHAR(255),
    event_id INT,
    PRIMARY KEY (email, event_id),
    FOREIGN KEY (email) REFERENCES Authentication(email),
    FOREIGN KEY (event_id) REFERENCES Events(event_id)
);

CREATE TABLE Proposed_Event_Time (
    proposed_event_time_id INT NOT NULL AUTO_INCREMENT, 
    event_id INT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    PRIMARY KEY (proposed_event_time_id),
    FOREIGN KEY (event_id) REFERENCES Events(event_id)
);

CREATE TABLE Availability (
    email VARCHAR(255),
    proposed_event_time_id INT,
    PRIMARY KEY (email, proposed_event_time_id),
    FOREIGN KEY (email) REFERENCES Authentication(email),
    FOREIGN KEY (proposed_event_time_id) REFERENCES Proposed_Event_Time(proposed_event_time_id)
);