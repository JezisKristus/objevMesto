-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Počítač: 127.0.0.1
-- Vytvořeno: Pon 13. dub 2026, 09:38
-- Verze serveru: 10.4.32-MariaDB
-- Verze PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT = @@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS = @@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION = @@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databáze: `db_city_explorer`
--

-- --------------------------------------------------------

--
-- Struktura tabulky `cities`
--

CREATE TABLE `cities`
(
    `id`   int(11)      NOT NULL,
    `name` varchar(255) NOT NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `cities`
--

INSERT INTO `cities` (`id`, `name`)
VALUES (1, 'Praha'),
       (2, 'Brno'),
       (3, 'Ostrava');

-- --------------------------------------------------------

--
-- Struktura tabulky `comments`
--

CREATE TABLE `comments`
(
    `id`          int(11)      NOT NULL,
    `place_id`    int(11)      NOT NULL,
    `author_name` varchar(255) NOT NULL,
    `text`        text         NOT NULL,
    `created_at`  datetime DEFAULT current_timestamp()
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `comments`
--

INSERT INTO `comments` (`id`, `place_id`, `author_name`, `text`, `created_at`)
VALUES (1, 1, 'Jan Špalek', 'Bylo to good', '2026-04-07 12:00:15'),
       (2, 1, 'Šan Danek', 'Bylo to bad', '2026-04-07 12:00:15'),
       (3, 1, 'vomáčka', 'Zajímavá destinace imo', '2026-04-07 12:13:35'),
       (4, 4, 'On', 'Celkem fajn', '2026-04-13 09:22:28');

-- --------------------------------------------------------

--
-- Struktura tabulky `places`
--

CREATE TABLE `places`
(
    `id`          int(11)                                              NOT NULL,
    `city_id`     int(11)                                              NOT NULL,
    `type`        enum ('Restaurace','Památka','Zajímavost','Ostatní') NOT NULL,
    `name`        varchar(255)                                         NOT NULL,
    `description` text                                                 NOT NULL,
    `address`     varchar(255)                                         NOT NULL,
    `image_url`   varchar(255) DEFAULT NULL
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `places`
--

INSERT INTO `places` (`id`, `city_id`, `type`, `name`, `description`, `address`, `image_url`)
VALUES (1, 1, 'Památka', 'Orloj', 'Lorem Ipsum', 'Praha 1, ', NULL),
       (2, 2, 'Památka', 'Orloj', 'Horší než ten Pražskej', 'Brno 1', NULL),
       (3, 1, 'Restaurace', 'U Karla', 'Dobrý jídlo třeba', 'Praha 9, Varnsdorfská 158', NULL),
       (4, 2, 'Ostatní', 'Starto Brno', 'Nedá se to pít', 'Všude', NULL),
       (5, 1, 'Restaurace', 'Kája', 'Nom', 'Nom', NULL);

-- --------------------------------------------------------

--
-- Struktura tabulky `ratings`
--

CREATE TABLE `ratings`
(
    `id`       int(11) NOT NULL,
    `place_id` int(11) NOT NULL,
    `stars`    int(11) NOT NULL CHECK (`stars` >= 1 and `stars` <= 5)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

--
-- Vypisuji data pro tabulku `ratings`
--

INSERT INTO `ratings` (`id`, `place_id`, `stars`)
VALUES (1, 1, 3),
       (2, 1, 5),
       (3, 1, 3),
       (4, 1, 4),
       (5, 1, 3),
       (6, 3, 4),
       (7, 4, 4),
       (8, 4, 3),
       (9, 4, 4),
       (10, 4, 3),
       (11, 4, 4),
       (12, 4, 5),
       (13, 2, 2),
       (14, 2, 4),
       (15, 2, 5),
       (16, 2, 5),
       (17, 2, 5),
       (18, 5, 5);

--
-- Indexy pro exportované tabulky
--

--
-- Indexy pro tabulku `cities`
--
ALTER TABLE `cities`
    ADD PRIMARY KEY (`id`);

--
-- Indexy pro tabulku `comments`
--
ALTER TABLE `comments`
    ADD PRIMARY KEY (`id`),
    ADD KEY `place_id` (`place_id`);

--
-- Indexy pro tabulku `places`
--
ALTER TABLE `places`
    ADD PRIMARY KEY (`id`),
    ADD KEY `city_id` (`city_id`);

--
-- Indexy pro tabulku `ratings`
--
ALTER TABLE `ratings`
    ADD PRIMARY KEY (`id`),
    ADD KEY `place_id` (`place_id`);

--
-- AUTO_INCREMENT pro tabulky
--

--
-- AUTO_INCREMENT pro tabulku `cities`
--
ALTER TABLE `cities`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 4;

--
-- AUTO_INCREMENT pro tabulku `comments`
--
ALTER TABLE `comments`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 5;

--
-- AUTO_INCREMENT pro tabulku `places`
--
ALTER TABLE `places`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 6;

--
-- AUTO_INCREMENT pro tabulku `ratings`
--
ALTER TABLE `ratings`
    MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
    AUTO_INCREMENT = 19;

--
-- Omezení pro exportované tabulky
--

--
-- Omezení pro tabulku `comments`
--
ALTER TABLE `comments`
    ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `places`
--
ALTER TABLE `places`
    ADD CONSTRAINT `places_ibfk_1` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`) ON DELETE CASCADE;

--
-- Omezení pro tabulku `ratings`
--
ALTER TABLE `ratings`
    ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`place_id`) REFERENCES `places` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT = @OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS = @OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION = @OLD_COLLATION_CONNECTION */;
