-- MariaDB dump 10.19  Distrib 10.5.12-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: u742768766_bdrtv
-- ------------------------------------------------------
-- Server version	10.5.12-MariaDB-cll-lve

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `atual`
--

DROP TABLE IF EXISTS `atual`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `atual` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapa` int(11) NOT NULL,
  `horario` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atual`
--

/*!40000 ALTER TABLE `atual` DISABLE KEYS */;
INSERT INTO `atual` VALUES (1,1,'d','0');
/*!40000 ALTER TABLE `atual` ENABLE KEYS */;

--
-- Table structure for table `doors`
--

DROP TABLE IF EXISTS `doors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `doors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapa` int(11) NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  `auxx` int(11) NOT NULL,
  `auxy` int(11) NOT NULL,
  `mode` float NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `doors`
--

/*!40000 ALTER TABLE `doors` DISABLE KEYS */;
INSERT INTO `doors` VALUES (1,1,541,1600,635,1600,0),(2,1,695,580,695,487,-1.55);
/*!40000 ALTER TABLE `doors` ENABLE KEYS */;

--
-- Table structure for table `mapas`
--

DROP TABLE IF EXISTS `mapas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mapas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dia` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `x` int(11) NOT NULL,
  `y` int(11) NOT NULL,
  `tarde` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `noite` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `limits` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roofsd` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roofst` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roofsn` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mapas`
--

/*!40000 ALTER TABLE `mapas` DISABLE KEYS */;
INSERT INTO `mapas` VALUES (1,'hospital','assets/maps/hospital/terreo/mapad.png',587,1670,'assets/maps/hospital/terreo/mapaa.png','assets/maps/hospital/terreo/mapan.png','assets/maps/hospital/terreo/limits.png','assets/maps/hospital/terreo/roofs.png','assets/maps/hospital/terreo/roofs.png','assets/maps/hospital/terreo/roofs.png'),(2,'escola','assets/maps/escola/terreo/mapad.png',960,50,'','assets/maps/escola/terreo/mapan.png','assets/maps/escola/terreo/limits.png','assets/maps/escola/terreo/roofsd.png','','assets/maps/escola/terreo/roofsn.png');
/*!40000 ALTER TABLE `mapas` ENABLE KEYS */;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `players` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `destreza` int(11) NOT NULL,
  `stamina` int(11) NOT NULL,
  `battle` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (1,'Grekza','https://media.discordapp.net/attachments/1018942871434432603/1060252880885522483/Grekza.png?width=749&height=499',2,33,1),(2,'Arshavin','https://media.discordapp.net/attachments/1018942871434432603/1060252879413321758/Andrew_Arshavin.png?width=749&height=499',3,54,1),(3,'Arruda','https://media.discordapp.net/attachments/1018942871434432603/1060252880247984148/Arruda.png?width=749&height=499',3,52,1),(4,'Schneider','https://media.discordapp.net/attachments/1018942871434432603/1060252883683131492/Octavius_Schneider.png?width=749&height=499',5,90,1),(5,'Juan','https://media.discordapp.net/attachments/1018942871434432603/1060252881632104528/Juan.png?width=749&height=499',2,31,1),(6,'Lucas','https://media.discordapp.net/attachments/1018942871434432603/1060252882429034526/Lucas.png?width=749&height=499',5,85,1);
/*!40000 ALTER TABLE `players` ENABLE KEYS */;

--
-- Table structure for table `viloes`
--

DROP TABLE IF EXISTS `viloes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `viloes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `foto` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `destreza` int(11) NOT NULL,
  `stamina` int(11) NOT NULL,
  `battle` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `viloes`
--

/*!40000 ALTER TABLE `viloes` DISABLE KEYS */;
INSERT INTO `viloes` VALUES (1,'Bobo 1','https://media.discordapp.net/attachments/1018942871434432603/1065751814600937552/Envalur_Bobos.png?width=499&height=499',4,1,1),(2,'Bobo 2','https://media.discordapp.net/attachments/1018942871434432603/1065751814600937552/Envalur_Bobos.png?width=499&height=499',4,1,1),(3,'Bobo 3','https://media.discordapp.net/attachments/1018942871434432603/1065751814600937552/Envalur_Bobos.png?width=499&height=499',4,1,1),(4,'Bobo 4','https://media.discordapp.net/attachments/1018942871434432603/1065751814600937552/Envalur_Bobos.png?width=499&height=499',4,1,1),(5,'Bobo 5','https://media.discordapp.net/attachments/1018942871434432603/1065751814600937552/Envalur_Bobos.png?width=499&height=499',4,1,1),(6,'Envalur 1','https://media.discordapp.net/attachments/1018942871434432603/1065751233786282094/Envalur.png?width=499&height=499',6,115,1);
/*!40000 ALTER TABLE `viloes` ENABLE KEYS */;

--
-- Dumping routines for database 'u742768766_bdrtv'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-24  4:29:36
