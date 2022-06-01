DROP TABLE Sessions;
DROP TABLE Availability;
--- We manually delete foreign key, otherwise, we would face circular reference dependency error.
alter table Events drop FOREIGN KEY finalized_event_time_id;
DROP TABLE Proposed_Event_Time;
DROP TABLE Attendance;
DROP TABLE Events;
DROP TABLE User_Profile;
DROP TABLE Account_Verification;
DROP TABLE Notifications_Setting;
DROP TABLE Authentication;