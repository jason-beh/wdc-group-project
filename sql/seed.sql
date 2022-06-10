-- MySQL dump 10.13  Distrib 8.0.28, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: social
-- ------------------------------------------------------
-- Server version	8.0.28

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `social`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `social` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `social`;

--
-- Table structure for table `Account_Verification`
--

DROP TABLE IF EXISTS `Account_Verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Account_Verification` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  PRIMARY KEY (`email`),
  CONSTRAINT `account_verification_ibfk_1` FOREIGN KEY (`email`) REFERENCES `Authentication` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Account_Verification`
--

LOCK TABLES `Account_Verification` WRITE;
/*!40000 ALTER TABLE `Account_Verification` DISABLE KEYS */;
/*!40000 ALTER TABLE `Account_Verification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Attendance`
--

DROP TABLE IF EXISTS `Attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Attendance` (
  `email` varchar(255) NOT NULL,
  `event_id` int NOT NULL,
  PRIMARY KEY (`email`,`event_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Attendance`
--

LOCK TABLES `Attendance` WRITE;
/*!40000 ALTER TABLE `Attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `Attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Authentication`
--

DROP TABLE IF EXISTS `Authentication`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Authentication` (
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `isAdmin` tinyint(1) DEFAULT '0',
  `isVerified` tinyint(1) DEFAULT '0',
  `isGoogleSignUp` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Authentication`
--

LOCK TABLES `Authentication` WRITE;
/*!40000 ALTER TABLE `Authentication` DISABLE KEYS */;
INSERT INTO `Authentication` VALUES ('admin1@gmail.com','$argon2i$v=19$m=4096,t=3,p=1$QTUOixUx8wtcmQOA27KLVg$DI4UZdIMYDpdokitWWRSCD4d/+E4lfWoNkyFiBMgqjM',1,1,0),('user_1@gmail.com','$argon2i$v=19$m=4096,t=3,p=1$5gPR703G6zUOClJvOLk2DA$fNcBGlSdSVTtY5t8/vdq981jugXMjFLedF24ZE/NioM',0,1,0),('user_2@gmail.com','$argon2i$v=19$m=4096,t=3,p=1$HSpjaclpoO6wLO7l/nLCgQ$rmvvxp/d3hGlJB6t3kg/ZaJPaXP4gVlsi7v/CCA5IUI',0,1,0);
/*!40000 ALTER TABLE `Authentication` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Availability`
--

DROP TABLE IF EXISTS `Availability`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Availability` (
  `email` varchar(255) NOT NULL,
  `proposed_event_time_id` int NOT NULL,
  PRIMARY KEY (`email`,`proposed_event_time_id`),
  KEY `proposed_event_time_id` (`proposed_event_time_id`),
  CONSTRAINT `availability_ibfk_1` FOREIGN KEY (`proposed_event_time_id`) REFERENCES `Proposed_Event_Time` (`proposed_event_time_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Availability`
--

LOCK TABLES `Availability` WRITE;
/*!40000 ALTER TABLE `Availability` DISABLE KEYS */;
INSERT INTO `Availability` VALUES ('jason@jasonsquare.com',1),('test@look.com',1),('user_2@gmail.com',1),('jason@jasonsquare.com',2),('test@look.com',2),('user_2@gmail.com',2),('test3@ok.com',4),('user_1@gmail.com',4),('test3@ok.com',5),('user_1@gmail.com',5),('admin1@gmail.com',7),('test3@ok.com',7),('admin1@gmail.com',8),('test3@ok.com',8),('test3@ok.com',9),('admin1@gmail.com',10),('test3@ok.com',10);
/*!40000 ALTER TABLE `Availability` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Events`
--

DROP TABLE IF EXISTS `Events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Events` (
  `event_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `proposed_date` date DEFAULT NULL,
  `street_number` varchar(255) NOT NULL,
  `street_name` varchar(255) NOT NULL,
  `suburb` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL,
  `postcode` varchar(255) NOT NULL,
  `event_picture` varchar(255) DEFAULT NULL,
  `finalized_event_time_id` int DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  KEY `created_by` (`created_by`),
  KEY `finalized_event_time_id` (`finalized_event_time_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `Authentication` (`email`) ON DELETE CASCADE,
  CONSTRAINT `finalized_event_time_id` FOREIGN KEY (`finalized_event_time_id`) REFERENCES `Proposed_Event_Time` (`proposed_event_time_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Events`
--

LOCK TABLES `Events` WRITE;
/*!40000 ALTER TABLE `Events` DISABLE KEYS */;
INSERT INTO `Events` VALUES (1,'Marathon Adelaide','Are you excited for the annual marathon in Adelaide, where the best runners in the country gather and compete. Experience the thrill and accomplishment when finishing a marathon when you sign up to this event now !','admin1@gmail.com','2022-08-02','192','David Street','Adelaide','South Australia','Australia','5000','/images/events/1654610380967.jpg',2),(2,'Wine Tasting Mclavis Vale','Following the successful opening of wine manufacturing in Mclavis Vale, we are excited to announce that we are organising a wine tasting session of our newly launched wine brand ! Sign up here for the discount to be applied, you may even be able to purchase a whole bottle of wine with the applied discount. What are you waiting for wine lovers ?','admin1@gmail.com','2022-06-30','50','Mclavis Hills','Mclavis Vale','South Australia','Australia','5000','/images/events/1654610898333.jpg',NULL),(3,'Indoor Rock Climbing Course','This is a 2 hours training course for new and immature indoor rock climbers ! The course will be focused on introduce the basics on rock climbing and tips on improving the balance between your foot and hand coordination. \r\n\r\nSome snacks and drink will be provided on site.','user_2@gmail.com','2022-07-06','18','Justice Road','Melbourne ','New South Wales','Australia','5321','/images/events/1654611664964.jpg',8),(4,'Walk with a mentor Adelaide','This event is available to all current students that are planning to enter the workforce with an experienced mentor. This will be a simple 1 hour walk and talk where any questions you have about entering your field of workforce or are facing any difficulties trying to apply for a career.\r\n\r\nWear anything that you feel comfortable in and meet at Adelaide Hills !\r\n\r\nWe are partnered withy the University of Ade Hills','user_2@gmail.com','2022-06-25','200','James St','Birdwood','South Australia','Australia','5234','/images/events/1654612510472.jpg',NULL),(5,'Cocktail Making Class','Are you keen in making a career in the bartender field or interested in making a personal cocktail at home ? Then sign up to this class now ! We will be teaching the techniques and process in crafting an excellent cocktail. Age requirements only available for 18 and above.','user_1@gmail.com','2022-06-17','99','Lialson Street','Adelaide','South Australia','Australia','5000','/images/events/1654613886840.jpg',NULL);
/*!40000 ALTER TABLE `Events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Notifications_Setting`
--

DROP TABLE IF EXISTS `Notifications_Setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Notifications_Setting` (
  `email` varchar(255) NOT NULL,
  `is_event_cancelled` tinyint(1) DEFAULT '1',
  `is_availability_confirmed` tinyint(1) DEFAULT '1',
  `is_event_finalised` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`email`),
  CONSTRAINT `notifications_setting_ibfk_1` FOREIGN KEY (`email`) REFERENCES `Authentication` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Notifications_Setting`
--

LOCK TABLES `Notifications_Setting` WRITE;
/*!40000 ALTER TABLE `Notifications_Setting` DISABLE KEYS */;
INSERT INTO `Notifications_Setting` VALUES ('admin1@gmail.com',1,1,1),('user_1@gmail.com',1,1,1),('user_2@gmail.com',1,1,1);
/*!40000 ALTER TABLE `Notifications_Setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Proposed_Event_Time`
--

DROP TABLE IF EXISTS `Proposed_Event_Time`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Proposed_Event_Time` (
  `proposed_event_time_id` int NOT NULL AUTO_INCREMENT,
  `event_id` int DEFAULT NULL,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`proposed_event_time_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `proposed_event_time_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `Events` (`event_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Proposed_Event_Time`
--

LOCK TABLES `Proposed_Event_Time` WRITE;
/*!40000 ALTER TABLE `Proposed_Event_Time` DISABLE KEYS */;
INSERT INTO `Proposed_Event_Time` VALUES (1,1,'2022-08-01 20:30:00','2022-08-01 22:30:00'),(2,1,'2022-08-01 19:30:00','2022-08-01 21:30:00'),(3,2,'2022-06-30 02:30:00','2022-06-30 06:30:00'),(4,2,'2022-06-30 03:30:00','2022-06-30 07:30:00'),(5,2,'2022-06-30 13:30:00','2022-06-30 17:30:00'),(6,3,'2022-07-06 09:00:00','2022-07-06 11:00:00'),(7,3,'2022-07-06 09:30:00','2022-07-06 11:30:00'),(8,3,'2022-07-06 08:30:00','2022-07-06 10:30:00'),(9,4,'2022-06-24 23:30:00','2022-06-25 01:30:00'),(10,4,'2022-06-25 00:30:00','2022-06-25 02:30:00'),(11,5,'2022-06-17 11:30:00','2022-06-17 12:30:00'),(12,5,'2022-06-17 12:00:00','2022-06-17 13:00:00');
/*!40000 ALTER TABLE `Proposed_Event_Time` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Sessions`
--

DROP TABLE IF EXISTS `Sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int unsigned NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Sessions`
--

LOCK TABLES `Sessions` WRITE;
/*!40000 ALTER TABLE `Sessions` DISABLE KEYS */;
INSERT INTO `Sessions` VALUES ('7c6-zyJ-cXC0AylVEyWLiPXg6wBQ7GuT',1654757341,'{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"user\":{\"email\":\"user_1@gmail.com\",\"isAdmin\":0,\"profile_picture\":\"/user-profiles/1654614618332.jpg\"}}');
/*!40000 ALTER TABLE `Sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User_Profile`
--

DROP TABLE IF EXISTS `User_Profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User_Profile` (
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `instagram_handle` varchar(255) DEFAULT NULL,
  `facebook_handle` varchar(255) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`email`),
  CONSTRAINT `user_profile_ibfk_1` FOREIGN KEY (`email`) REFERENCES `Authentication` (`email`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User_Profile`
--

LOCK TABLES `User_Profile` WRITE;
/*!40000 ALTER TABLE `User_Profile` DISABLE KEYS */;
INSERT INTO `User_Profile` VALUES ('admin1@gmail.com','Danny','Franco','1996-06-12','DannyFc0','Danny David Franco ','Adelaide','Australia','/user-profiles/1654614463611.jpg'),('user_1@gmail.com','James','Bond','1981-06-24','Bond007','James Bond','London','United Kingdom','/user-profiles/1654614618332.jpg'),('user_2@gmail.com','Brianna','Taylor','1998-01-12','BriannaLoves','Brianna Taylor','California','United States of America','/user-profiles/1654614852214.jpg');
/*!40000 ALTER TABLE `User_Profile` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2022-06-08 16:24:54
