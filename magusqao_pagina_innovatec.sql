-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 25-11-2026 a las 15:04:39
-- Versión del servidor: 11.4.13-MariaDB-cll-lve
-- Versión de PHP: 8.4.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `magusqao_pagina_innovatec`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `blog_categories`
--

CREATE TABLE `blog_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `sort` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `blog_categories`
--

INSERT INTO `blog_categories` (`id`, `name`, `slug`, `sort`, `created_at`, `updated_at`) VALUES
(1, 'Eventos', 'eventos', 0, '2026-10-08 07:33:54', '2026-10-08 07:33:54'),
(2, 'Noticias', 'noticias', 1, '2026-10-08 07:33:54', '2026-10-08 07:33:54'),
(3, 'Tendencias', 'tendencias', 2, '2026-10-08 07:33:54', '2026-10-08 07:33:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `blog_category_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` varchar(300) DEFAULT NULL,
  `body` text NOT NULL,
  `cover_path` varchar(255) DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('proinnovatec-cache-4d08b9302fbf25f1f81a73a8a0b6d2e48334452d', 'i:1;', 1795606475),
('proinnovatec-cache-4d08b9302fbf25f1f81a73a8a0b6d2e48334452d:timer', 'i:1795606475;', 1795606475),
('proinnovatec-cache-7551b20874730aea908511c313923039b6627e4e', 'i:2;', 1795027058),
('proinnovatec-cache-7551b20874730aea908511c313923039b6627e4e:timer', 'i:1795027058;', 1795027058),
('proinnovatec-cache-hdkiOSnZ5yfLSyoj', 'a:1:{s:11:\"valid_until\";i:1795606324;}', 1796805004);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `name`, `email`, `phone`, `company`, `message`, `ip`, `read_at`, `created_at`, `updated_at`) VALUES
(2, 'w', 'wQww@s', NULL, NULL, 'wewesdcsc de ad wrf ssxc sxcc', '38.25.85.126', NULL, '2026-11-25 13:10:14', '2026-11-25 13:10:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `home_settings`
--

CREATE TABLE `home_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `brand_name` varchar(255) NOT NULL DEFAULT 'PROINNOVATEC',
  `logo_path` varchar(255) DEFAULT NULL,
  `video_path` varchar(255) DEFAULT NULL,
  `poster_path` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` text DEFAULT NULL,
  `buttons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `menu` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `nav_cta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `show_panel_link` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `sections` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `experience_bg_path` varchar(255) DEFAULT NULL,
  `page_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `home_settings`
--

INSERT INTO `home_settings` (`id`, `brand_name`, `logo_path`, `video_path`, `poster_path`, `title`, `subtitle`, `buttons`, `menu`, `nav_cta`, `show_panel_link`, `created_at`, `updated_at`, `sections`, `experience_bg_path`, `page_images`) VALUES
(1, 'PROINNOVATEC', NULL, NULL, 'hero/10a9d0f8f0c3cd2d.jpg', 'Transformando la tecnología en soluciones', 'Integración de soluciones TIC con más de 10 años de experiencia y certificaciones de los principales fabricantes.', '[{\"label\":\"Nuestras soluciones\",\"url\":\"\\/division-enterprise\",\"variant\":\"primary\"},{\"label\":\"Cont\\u00e1ctanos\",\"url\":\"\\/contacto\",\"variant\":\"outline\"}]', '[{\"label\":\"Inicio\",\"url\":\"\\/\",\"visible\":true,\"show_children\":true,\"hidden_children\":[],\"children\":[]},{\"label\":\"Nosotros\",\"url\":\"\\/nosotros\",\"visible\":true,\"show_children\":true,\"hidden_children\":[],\"children\":[]},{\"label\":\"Divisi\\u00f3n Enterprise\",\"url\":\"\\/division-enterprise\",\"visible\":true,\"show_children\":true,\"hidden_children\":[],\"children\":[{\"label\":\"Redes y Conectividad\",\"url\":\"\\/soluciones\\/networking\"},{\"label\":\"Ciberseguridad\",\"url\":\"\\/soluciones\\/ciberseguridad\"},{\"label\":\"Servidores, Storage y Backup\",\"url\":\"\\/soluciones\\/infraestructura-ti\"},{\"label\":\"Data Center y Energ\\u00eda\",\"url\":\"\\/soluciones\\/data-center-y-energia\"},{\"label\":\"Seguridad F\\u00edsica Inteligente\",\"url\":\"\\/soluciones\\/seguridad-electronica\"},{\"label\":\"Comunicaciones y Contact Center\",\"url\":\"\\/soluciones\\/comunicaciones-unificadas\"}]},{\"label\":\"Divisi\\u00f3n Services\",\"url\":\"\\/division-services\",\"visible\":true,\"show_children\":true,\"hidden_children\":[],\"children\":[{\"label\":\"prueba\",\"url\":\"\\/prueba\"}]},{\"label\":\"Casos de \\u00c9xito\",\"url\":\"\\/experiencia\",\"visible\":false,\"show_children\":true,\"hidden_children\":[],\"children\":[]},{\"label\":\"Panel de Aliados\",\"url\":\"\\/aliados\",\"visible\":false,\"show_children\":true,\"hidden_children\":[],\"children\":[]},{\"label\":\"Blog\",\"url\":\"\\/blog\",\"visible\":false,\"show_children\":true,\"hidden_children\":[],\"children\":[{\"label\":\"Eventos\",\"url\":\"\\/blog\\/eventos\"},{\"label\":\"Noticias\",\"url\":\"\\/blog\\/noticias\"},{\"label\":\"Tendencias\",\"url\":\"\\/blog\\/tendencias\"}]},{\"label\":\"Contacto\",\"url\":\"\\/contacto\",\"visible\":true,\"show_children\":true,\"hidden_children\":[],\"children\":[]}]', NULL, 0, '2026-10-07 06:07:16', '2026-11-25 19:30:11', '{\"company\":{\"name\":\"PROINNOVATEC\",\"legal_name\":\"GRUPO CAME E.I.R.L.\",\"tax_id\":\"20547064217\"},\"meta\":{\"menu_inicio\":true,\"orden_soluciones\":true},\"contact\":{\"email\":\"ventas@proinnovatec.com\",\"phone\":\"+511 748-3615\",\"whatsapp\":\"970855741\",\"address\":\"Av. Javier Prado Este Nro. 1166 Of 801 - San Isidro\",\"hours\":\"\",\"website\":\"www.proinnovatec.com\",\"title\":\"Cont\\u00e1ctanos\",\"body\":\"No dudes en escribirnos si tienes alguna pregunta.\"},\"social\":{\"facebook\":\"\",\"linkedin\":\"https:\\/\\/www.linkedin.com\\/company\\/proinnovatec\\/home\\/\",\"instagram\":\"\",\"youtube\":\"\",\"tiktok\":\"\"},\"footer\":{\"tagline\":\"Integraci\\u00f3n de soluciones de Tecnolog\\u00edas de la Informaci\\u00f3n y Comunicaciones.\",\"copyright\":\"\"},\"clients\":{\"title\":\"Clientes que nos\",\"accent\":\"respaldan\",\"intro\":\"Empresas e instituciones de miner\\u00eda, educaci\\u00f3n, telecomunicaciones y comercio conf\\u00edan en nuestro equipo t\\u00e9cnico para integrar y mantener sus soluciones TIC.\"},\"analytics\":{\"ga_id\":\"G-F1QBJPGQW2\"},\"telcos\":{\"title\":\"DIVISI\\u00d3N SERVICES\",\"subtitle\":\"Tu aliado en ingenier\\u00eda y servicios especializados TIC\",\"intro\":\"Ampliamos la capacidad t\\u00e9cnica de integradores, operadores de telecomunicaciones y proveedores tecnol\\u00f3gicos mediante servicios de preventa, implementaci\\u00f3n, configuraci\\u00f3n, migraci\\u00f3n y soporte especializado.\\r\\n\\r\\nT\\u00fa comercializas la soluci\\u00f3n, nosotros aportamos la ingenier\\u00eda para ejecutarla.\",\"partner_title\":\"Extendemos tu capacidad t\\u00e9cnica\",\"partner_text\":\"En PROINNOVATEC somos el aliado t\\u00e9cnico de integradores, operadores y proveedores tecnol\\u00f3gicos.\\r\\n\\r\\nComplementamos sus equipos con ingenier\\u00eda especializada para desarrollar e implementar proyectos TIC, sin necesidad de ampliar su estructura operativa.\\r\\n\\r\\nRespetamos la relaci\\u00f3n comercial con sus clientes y trabajamos como una extensi\\u00f3n de su equipo.\",\"values_title\":\"\\u00bfPor qu\\u00e9 trabajar con PROINNOVATEC?\",\"values_intro\":\"Combinamos especializaci\\u00f3n t\\u00e9cnica, flexibilidad operativa y compromiso comercial para que nuestros socios ejecuten sus proyectos con confianza y respaldo profesional.\",\"home_button_label\":\"Conoce la divisi\\u00f3n\",\"cta_title\":\"\\u00bfNecesitas un aliado t\\u00e9cnico para ejecutar tus pr\\u00f3ximos proyectos?\"},\"enterprise\":{\"title\":\"DIVISI\\u00d3N ENTERPRISE\",\"subtitle\":\"Soluciones tecnol\\u00f3gicas para impulsar y proteger tu empresa.\",\"intro\":\"Dise\\u00f1amos, suministramos e implementamos soluciones TIC que fortalecen la infraestructura, seguridad y continuidad operativa de las organizaciones.\\r\\n\\r\\nCombinamos tecnolog\\u00eda e ingenier\\u00eda especializada para acompa\\u00f1ar a nuestros clientes desde el dise\\u00f1o hasta la implementaci\\u00f3n y el soporte.\",\"cta_label\":\"Cont\\u00e1ctanos\",\"cta_url\":\"\\/contacto\",\"cta_title\":\"\\u00bfBuscas modernizar o fortalecer la tecnolog\\u00eda de tu empresa?\"},\"services\":{\"title\":\"Ingenier\\u00eda y soporte especializado\",\"intro\":\"Complementamos cada soluci\\u00f3n con ingenier\\u00eda especializada: dise\\u00f1o, implementaci\\u00f3n, integraci\\u00f3n, mantenimiento y soporte t\\u00e9cnico. Acompa\\u00f1amos a nuestros clientes en todo el ciclo de vida de su infraestructura, coordinando con sus equipos para asegurar continuidad, rendimiento y evoluci\\u00f3n tecnol\\u00f3gica.\"},\"about\":{\"title\":\"Referentes en la integraci\\u00f3n de soluciones\",\"accent\":\"TIC\",\"body\":\"Un equipo con m\\u00e1s de 10 a\\u00f1os de experiencia, respaldado por una s\\u00f3lida trayectoria en ingenier\\u00eda y certificaciones t\\u00e9cnicas de los principales fabricantes del sector.\",\"more_label\":\"Conoce m\\u00e1s sobre nosotros\",\"story\":\"PROINNOVATEC se destaca como un referente en la integraci\\u00f3n de soluciones de Tecnolog\\u00edas de la Informaci\\u00f3n y Comunicaciones. Nuestro compromiso con la excelencia y la innovaci\\u00f3n se refleja en cada proyecto que emprendemos. Contamos con un equipo altamente capacitado con m\\u00e1s de 10 a\\u00f1os de experiencia, respaldado por una s\\u00f3lida trayectoria en ingenier\\u00eda y certificaciones t\\u00e9cnicas de los principales fabricantes del sector. La pasi\\u00f3n por la tecnolog\\u00eda y la b\\u00fasqueda constante de soluciones eficientes nos impulsan a seguir creciendo y superando expectativas en el \\u00e1mbito de las TIC.\",\"mission\":\"\",\"vision\":\"\",\"objectives\":\"\"}}', 'seed/zPpIhvPE8N5S5x5Z6Ie4fDHKY47kn1Mrzu1afnkl.jpg', '{\"clientes\":\"seed\\/tTQ4MKt5AySc5IiwvRPQTW4Dk00bT9Z7nOckccua.jpg\",\"contacto\":\"seed\\/gNl8tNYVniU75CjiwaPF6M9IdXu7AMiziKetxNbv.jpg\",\"nosotros\":\"seed\\/LBIOcAnsYqatuf8ZqFrbuwu9NA46uk9aCdKFTgjM.jpg\",\"experiencia\":\"seed\\/zPpIhvPE8N5S5x5Z6Ie4fDHKY47kn1Mrzu1afnkl.jpg\",\"enterprise\":\"seed\\/7PYpl25zMJnjXpAISyAKEhFcbkfEwSALqTjLmzf6.jpg\",\"telcos_partner\":\"seed\\/bGaXJOZg6i2nWHJxgVTXW1wCEPsO6TmfOjvsWzPf.jpg\",\"telcos\":\"seed\\/sjecur2CwHgXPGAEgll8v9kl0QsUSQGGxK3wuTc0.jpg\",\"mission\":\"seed\\/THCVGcvDrzCgQULkrCjaqsMJNRLAZMM6zAa0RPEP.jpg\",\"vision\":\"seed\\/7X9sZXRRvmeiGDD1ETkpgKJhQz5JQMFeWrAMKS1b.jpg\",\"objectives\":\"seed\\/wmbNaG4xGy0szo2Yzkb5a2X48RHWvQvKeZaq3d3e.jpg\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_10_07_025940_create_personal_access_tokens_table', 1),
(5, '2026_10_07_030554_create_home_settings_table', 1),
(6, '2026_10_07_184653_create_section_items_table', 1),
(7, '2026_10_07_184654_add_sections_to_home_settings_table', 1),
(8, '2026_10_08_034530_add_pages_support_to_content_tables', 1),
(9, '2026_10_08_035934_create_contact_messages_table', 1),
(10, '2026_10_08_043236_create_blog_tables', 1),
(11, '2026_10_12_193949_add_label_to_section_items_table', 2),
(12, '2026_10_16_000001_add_role_and_active_to_users_table', 3),
(13, '2026_10_22_000001_create_roles_and_permissions_tables', 4),
(14, '2026_10_23_000001_add_show_panel_link_to_home_settings_table', 5),
(15, '2026_10_23_000002_add_visible_to_section_items_table', 5),
(16, '2026_11_03_000001_grant_allies_page_to_roles_with_experience', 6),
(17, '2026_11_03_000002_add_allies_page_to_menu', 7),
(18, '2026_11_04_000001_add_two_factor_to_users_table', 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(60) NOT NULL,
  `slug` varchar(60) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_super` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id`, `name`, `slug`, `description`, `is_super`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin', 'Acceso total, incluida la gestión de usuarios y roles.', 1, '2026-10-22 18:55:12', '2026-10-22 18:55:12'),
(2, 'Editor', 'editor', 'Edita las páginas del sitio y el blog.', 0, '2026-10-22 18:55:12', '2026-10-22 18:55:12'),
(3, 'Redactor', 'redactor', 'Solo escribe y publica en el blog.', 0, '2026-10-22 18:55:12', '2026-10-22 18:55:12'),
(4, 'Comercial', 'comercial', 'Solo atiende los mensajes del formulario de contacto.', 0, '2026-10-22 18:55:12', '2026-10-22 18:55:12');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `permission` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission`) VALUES
(2, 'blog.categories'),
(2, 'blog.delete'),
(2, 'blog.view'),
(2, 'blog.write'),
(2, 'pages.aliados'),
(2, 'pages.clientes'),
(2, 'pages.contacto'),
(2, 'pages.enterprise'),
(2, 'pages.experiencia'),
(2, 'pages.inicio'),
(2, 'pages.nosotros'),
(2, 'pages.telcos'),
(3, 'blog.categories'),
(3, 'blog.delete'),
(3, 'blog.view'),
(3, 'blog.write'),
(4, 'messages.delete'),
(4, 'messages.view');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `section_items`
--

CREATE TABLE `section_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `section` varchar(255) NOT NULL,
  `slug` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `body` text DEFAULT NULL,
  `rows` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `url` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `sort` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `visible` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `section_items`
--

INSERT INTO `section_items` (`id`, `section`, `slug`, `title`, `body`, `rows`, `url`, `label`, `image_path`, `sort`, `visible`, `created_at`, `updated_at`, `gallery`) VALUES
(1, 'about_card', NULL, 'División Enterprise', NULL, NULL, '/division-enterprise', NULL, 'seed/duRB7SNjKLh8BcJsQRqVsp8D1CKRsYsWcDCulu4U.jpg', 0, 1, '2026-10-07 21:48:37', '2026-10-12 22:35:21', NULL),
(2, 'about_card', NULL, 'División Telcos', NULL, NULL, '/division-services', NULL, 'seed/Dqz0TD1c8mrC5mtt3ZOryFUqVliy80xcwJispyuO.jpg', 1, 1, '2026-10-07 21:48:37', '2026-11-25 19:29:40', NULL),
(3, 'solution', 'comunicaciones-unificadas', 'Comunicaciones y Contact Center', 'Integramos plataformas de comunicación, atención omnicanal y automatización para mejorar la colaboración y la experiencia del cliente.', '[{\"title\":\"Contact Center omnicanal\",\"description\":\"Gesti\\u00f3n unificada de voz, WhatsApp, correo y canales digitales.\"},{\"title\":\"Automatizaci\\u00f3n e IA conversacional\",\"description\":\"Chatbots, asistentes virtuales y flujos inteligentes.\"},{\"title\":\"Telefon\\u00eda empresarial\",\"description\":\"Centrales IP, comunicaciones SIP y telefon\\u00eda cloud.\"},{\"title\":\"Colaboraci\\u00f3n y videoconferencia\",\"description\":\"Plataformas de reuniones, pantallas interactivas  y comunicaciones corporativas.\"},{\"title\":\"Integraci\\u00f3n y anal\\u00edtica\",\"description\":\"Conexi\\u00f3n con CRM, reportes, indicadores y supervisi\\u00f3n de interacciones.\"}]', NULL, NULL, 'solution/dd1566e1c36e831e.jpg', 5, 1, '2026-10-07 21:48:37', '2026-11-25 14:45:13', '[{\"path\":\"seed\\/TZwWskc2w1HYJxlR4v8jOHpDqxn94MbmKMAYJDC8.png\",\"name\":\"Audiocodes\"},{\"path\":\"seed\\/PZP4CDDzp37JOEf6ogYXEbB8wSwYhf1VIPIr9EO7.png\",\"name\":\"Yeastar\"},{\"path\":\"seed\\/LLwU3sYcgUQ75JulEOT5R3k649iJN0NAFKCz9MEV.png\",\"name\":\"Poly\"},{\"path\":\"seed\\/9cfOUoZxH3zBkb39z7zG4IdGtz4gaJbCbNX2npWn.png\",\"name\":\"Huawei\"}]'),
(4, 'solution', 'ciberseguridad', 'Ciberseguridad', 'Protegemos los activos digitales de las organizaciones mediante soluciones de prevención, detección y respuesta frente a amenazas de ciberseguridad.', '[{\"title\":\"Identidad y acceso\",\"description\":\"IAM, MFA, SSO y gesti\\u00f3n de privilegios.\"},{\"title\":\"Seguridad de dispositivos\",\"description\":\"Protecci\\u00f3n endpoint, EDR, XDR y seguridad de servidores.\"},{\"title\":\"Seguridad de red\",\"description\":\"NGFW, IPS, NAC, ZTNA y segmentaci\\u00f3n IT\\/OT.\"},{\"title\":\"Seguridad de aplicaciones\",\"description\":\"WAF, protecci\\u00f3n de API y gesti\\u00f3n de vulnerabilidades.\"},{\"title\":\"Protecci\\u00f3n de datos\",\"description\":\"DLP, cifrado y clasificaci\\u00f3n de informaci\\u00f3n.\"},{\"title\":\"Seguridad en la nube\",\"description\":\"Protecci\\u00f3n de entornos cloud, aplicaciones SaaS y cargas de trabajo.\"},{\"title\":\"Monitoreo y respuesta\",\"description\":\"SIEM, SOC, detecci\\u00f3n de amenazas y respuesta ante incidentes.\"}]', NULL, NULL, 'solution/7c5034f00b95b711.jpg', 1, 1, '2026-10-07 21:48:37', '2026-11-25 14:45:13', '[{\"path\":\"seed\\/yuzxEx4TWxrYQ7Pg6u0lxx2g5yyzGLWK085GDOBy.png\",\"name\":\"Fortinet\"},{\"path\":\"seed\\/zsWq6OEcwvbJ7dmumCMDWZeAakeKnrcuhFItaNLa.png\",\"name\":\"Sophos\"}]'),
(5, 'solution', 'networking', 'Redes y Conectividad', 'Diseñamos e implementamos infraestructuras de comunicación seguras, escalables y de alto rendimiento para entornos empresariales e industriales.', '[{\"title\":\"Switching y Routing\",\"description\":\"Redes LAN, core, distribuci\\u00f3n, acceso y conectividad WAN.\"},{\"title\":\"Conectividad inal\\u00e1mbrica\",\"description\":\"Wi-Fi empresarial, controladores WLAN y enlaces PTP\\/PTMP.\"},{\"title\":\"SD-WAN y conectividad multisede\",\"description\":\"Interconexi\\u00f3n, redundancia y optimizaci\\u00f3n del tr\\u00e1fico.\"},{\"title\":\"Cableado estructurado y fibra \\u00f3ptica\",\"description\":\"Infraestructura pasiva, enlaces \\u00f3pticos y certificaci\\u00f3n.\"},{\"title\":\"Redes industriales\",\"description\":\"Conectividad para entornos OT, plantas industriales y miner\\u00eda.\"},{\"title\":\"Gesti\\u00f3n y monitoreo\",\"description\":\"Administraci\\u00f3n centralizada, supervisi\\u00f3n y optimizaci\\u00f3n de redes.\"}]', NULL, NULL, 'solution/8d509a44313bbcd2.jpg', 0, 1, '2026-10-07 21:48:37', '2026-11-25 14:45:13', '[{\"path\":\"seed\\/wOWFjYWhZ41PJ04cTcFVtO9efUyTGfpk9BBDl77b.png\",\"name\":\"Huawei\"},{\"path\":\"seed\\/2s5xTtR0FpYzRpASgDVwHkOAiU52FRRdtsxolKuD.png\",\"name\":\"Aruba\"},{\"path\":\"seed\\/2Z7TYbdeNsmvexxj4nXNwjj6WWzHsm3LexAJI8Nf.png\",\"name\":\"Fortinet\"}]'),
(6, 'solution', 'infraestructura-ti', 'Servidores, Storage y Backup', 'Implementamos soluciones de cómputo, almacenamiento y protección de datos para garantizar la disponibilidad y recuperación de los sistemas empresariales.', '[{\"title\":\"Servidores empresariales\",\"description\":\"Plataformas de c\\u00f3mputo f\\u00edsico, rack y torre.\"},{\"title\":\"Virtualizaci\\u00f3n e hiperconvergencia\",\"description\":\"Infraestructura virtual, HCI y consolidaci\\u00f3n de servidores.\"},{\"title\":\"Almacenamiento empresarial\",\"description\":\"Sistemas SAN, NAS y almacenamiento definido por software.\"},{\"title\":\"Backup y protecci\\u00f3n de datos\",\"description\":\"Respaldo automatizado, replicaci\\u00f3n y almacenamiento inmutable.\"},{\"title\":\"Recuperaci\\u00f3n ante desastres\",\"description\":\"Soluciones DR, continuidad de servicios y restauraci\\u00f3n de sistemas.\"}]', NULL, NULL, 'solution/bc504ff03d9f444e.jpg', 2, 1, '2026-10-07 21:48:37', '2026-11-25 14:45:13', '[{\"path\":\"seed\\/R0KhagpPL12uFSplKvZLx2p0vfTEdkGH3OKUmMY5.png\",\"name\":\"Lenovo\"},{\"path\":\"seed\\/xHSLdeDUOzLtyVSZE3tX1h07ateavsJh0ZxJbWQU.png\",\"name\":\"Hpe\"},{\"path\":\"seed\\/K0GIMsGAcqvIHmd0udlmK5CDQBI6D8uGMX5YP9yi.png\",\"name\":\"Fusion\"},{\"path\":\"seed\\/wKL1e7btwlfgBLOkc8OguXjMemcYyKwpPeql3GC6.png\",\"name\":\"Zabbix\"}]'),
(7, 'solution', 'seguridad-electronica', 'Seguridad Física Inteligente', 'Integramos videovigilancia, inteligencia artificial y sistemas de seguridad electrónica para proteger instalaciones y optimizar la supervisión de operaciones.', '[{\"title\":\"Videovigilancia IP\",\"description\":\"C\\u00e1maras empresariales, industriales, PTZ y t\\u00e9rmicas.\"},{\"title\":\"Anal\\u00edtica de video e IA\",\"description\":\"Detecci\\u00f3n de eventos, reconocimiento de objetos y an\\u00e1lisis inteligente.\"},{\"title\":\"Automatizaci\\u00f3n de seguridad\",\"description\":\"Alertas, reglas de respuesta e integraci\\u00f3n de eventos.\"},{\"title\":\"gesti\\u00f3n de accesos y visitantes\",\"description\":\"Biometr\\u00eda, credenciales y gesti\\u00f3n de ingresos.\"},{\"title\":\"Seguridad perimetral e intrusi\\u00f3n\",\"description\":\"Detecci\\u00f3n de accesos no autorizados y protecci\\u00f3n de instalaciones.\"},{\"title\":\"Gesti\\u00f3n centralizada\",\"description\":\"Plataformas VMS e integraci\\u00f3n de sistemas de seguridad f\\u00edsica.\"}]', NULL, NULL, 'solution/803ffd3e86393b02.jpg', 4, 1, '2026-10-07 21:48:37', '2026-11-25 14:45:13', '[{\"path\":\"seed\\/9k7M3KqhaxOpzCT8t3bs7sOt4iQLt74ikHOcsvdq.png\",\"name\":\"Hikvision\"},{\"path\":\"seed\\/YWZPuzoOv4AovD4wmX7aPafq58vgJsLRONMd0zDz.png\",\"name\":\"Axis\"}]'),
(8, 'service', 'consultoria', 'Ingeniería e Implementación', 'Diseñamos, implementamos e integramos soluciones tecnológicas adaptadas a los requerimientos de cada organización.', '[{\"title\":\"Dise\\u00f1o y dimensionamiento\",\"description\":\"Arquitectura t\\u00e9cnica, evaluaci\\u00f3n de factibilidad y planificaci\\u00f3n de soluciones.\"},{\"title\":\"Implementaci\\u00f3n e integraci\\u00f3n\",\"description\":\"Instalaci\\u00f3n, configuraci\\u00f3n y puesta en producci\\u00f3n de plataformas tecnol\\u00f3gicas.\"},{\"title\":\"Pruebas y documentaci\\u00f3n\",\"description\":\"Validaci\\u00f3n funcional, pruebas de aceptaci\\u00f3n y entrega de documentaci\\u00f3n t\\u00e9cnica.\"}]', NULL, NULL, 'seed/JO0nJFiVYf503bBZEXbJAZflJYQZeUWr5wfYlHj6.jpg', 0, 1, '2026-10-07 21:48:37', '2026-11-25 14:15:05', NULL),
(9, 'service', 'help-desk', 'Soporte y Mantenimiento', 'Brindamos soporte técnico especializado, monitoreo NOC/SOC y mantenimiento de infraestructura tecnológica para fortalecer la disponibilidad, seguridad y continuidad operativa.', '[{\"title\":\"Soporte t\\u00e9cnico especializado\",\"description\":\"Diagn\\u00f3stico, atenci\\u00f3n de incidencias y resoluci\\u00f3n de problemas tecnol\\u00f3gicos.\"},{\"title\":\"Monitoreo NOC\\/SOC\",\"description\":\"Supervisi\\u00f3n de infraestructura, redes y eventos de ciberseguridad, con detecci\\u00f3n, alertamiento y gesti\\u00f3n de incidentes.\"},{\"title\":\"Mantenimiento preventivo y correctivo\",\"description\":\"Inspecci\\u00f3n, actualizaci\\u00f3n, diagn\\u00f3stico de fallas y recuperaci\\u00f3n de servicios tecnol\\u00f3gicos.\"}]', NULL, NULL, 'seed/1ZvYyBM6YJAOd9asDtEFgRS3KwmLhmNc8BioFV6n.jpg', 1, 1, '2026-10-07 21:48:37', '2026-11-25 14:20:06', NULL),
(10, 'service', 'outsourcing-tic', 'Optimización y Modernización', 'Evolucionamos las plataformas tecnológicas mediante mejoras de rendimiento, actualizaciones y modernización de infraestructura.', '[{\"title\":\"Optimizaci\\u00f3n de infraestructura\",\"description\":\"Evaluaci\\u00f3n de desempe\\u00f1o, ajustes de configuraci\\u00f3n y mejoras operativas.\"},{\"title\":\"Actualizaci\\u00f3n tecnol\\u00f3gica\",\"description\":\"Actualizaciones de software, firmware y modernizaci\\u00f3n de plataformas.\"},{\"title\":\"Migraci\\u00f3n y renovaci\\u00f3n\",\"description\":\"Transici\\u00f3n hacia nuevas tecnolog\\u00edas, reemplazo de sistemas e integraci\\u00f3n con entornos existentes.\"}]', NULL, NULL, 'seed/XSEeIxeZGdCpus9PCCcXUXTEM80TbxHcM0vcYDGv.jpg', 2, 1, '2026-10-07 21:48:37', '2026-11-25 14:22:33', '[{\"path\":\"seed\\/ArdyccnI22T6MqnzT8Rv9hDafyqOmFyw9tsrJFDC.png\",\"name\":\"Sophos\"},{\"path\":\"seed\\/MqVsPhLvRbeLIFzwx1qE2YkvCzlthbleJLl0vuCC.png\",\"name\":\"Fortinet\"},{\"path\":\"seed\\/We6bhakRERkqc6dfRAForZMHKLyBzJTeBh6W5Dd7.png\",\"name\":\"Cisco\"},{\"path\":\"seed\\/XnySgAc1wXJE7SJh6UJlNghpxialJXYz4R3q8XR5.png\",\"name\":\"Yeastar\"}]'),
(11, 'case', NULL, 'Minera Titán', 'Estandarización de redes Cisco, comunicaciones Yeastar y Yealink, y seguridad con Fortinet y Sophos en oficinas, plantas, minas y campamentos mineros. Hoy brindamos outsourcing en ciberseguridad, networking y comunicaciones.', NULL, NULL, NULL, 'seed/7XWzZRIHbdfifqJMlA4ffFCSGRk51ikmOnGUJZwB.png', 0, 1, '2026-10-07 21:48:38', '2026-10-08 07:08:40', '[{\"name\": \"Cisco\", \"path\": \"seed/6kVJH11vtRazuQGgXrcz9CzkMl6hyuCwqLlLuOu9.png\"}, {\"name\": \"Yeastar\", \"path\": \"seed/3iLg2OgVvwfcsY6bJxxA5uWuMkfx1Imm1YLqreRL.png\"}, {\"name\": \"Yealink\", \"path\": \"seed/LBzZVyj4rG2rz27YAQFbP1AcearGdSdqH3lUDvbf.png\"}, {\"name\": \"Fortinet\", \"path\": \"seed/M7dGpncVLNuTfnnRtDfo1ipW9zn2lcqPfmkz8pJo.png\"}, {\"name\": \"Sophos\", \"path\": \"seed/dt3gULtl4KMfazRcyjVFbZWDcWDSCaJTHrwlknZt.png\"}]'),
(12, 'case', NULL, 'Innova ITC · Telefónica', 'Homologación de routers ONE ACCESS para Telefónica: validación de MPLS, OSPF, BGP, VRRP, IPSEC, QoS, Netflow e IP SLA en maquetas, y pruebas de alto tráfico.', NULL, NULL, NULL, 'seed/fljJ33LfooQIHDYVLbjZVswDbTllmKlgKNJlOdAa.png', 1, 1, '2026-10-07 21:48:38', '2026-10-08 07:08:40', '[{\"name\": \"One Access\", \"path\": \"seed/wDJIf3aTksvA9lQ0o7emcT4ExJLaaR95HKuHh8ih.png\"}, {\"name\": \"Telefonica\", \"path\": \"seed/dMlpW7DGu0UBn85mmeenLtayCP9oXTwj3CxgQRWh.png\"}]'),
(13, 'case', NULL, 'SENATI', 'Plataforma de comunicaciones unificadas en más de 120 sedes con Yeastar, Yealink y Audiocodes, migrada desde una central Nortel, y un IVR a medida que enruta la llamada según el código del alumno.', NULL, NULL, NULL, 'seed/OBUOUodNpUMVzzkzKxlk4RyNkxKM6G0ar6DV1Pcf.png', 2, 1, '2026-10-07 21:48:38', '2026-10-08 07:08:40', '[{\"name\": \"Yeastar\", \"path\": \"seed/PGStts96x6oZuki1dLsFtm3xkNVJ9SKTIyrProe7.png\"}, {\"name\": \"Yealink\", \"path\": \"seed/8Y2G5ekXdmiHGNGc42CoGO4vqauBdgKGdJoaMt8G.png\"}, {\"name\": \"Audiocodes\", \"path\": \"seed/6bxRXFzfm7aEghVf8rvK5q9dkZAfx5YmZntejTfZ.png\"}]'),
(14, 'case', NULL, 'Colegio María de los Ángeles', 'Red Wi-Fi Ubiquiti con más de 30 puntos de acceso, switch core y firewall, como parte de una estrategia de transformación digital para aulas híbridas.', NULL, NULL, NULL, 'seed/CbZB4UFgmAYuD0ZLOgdN4er0fuewHYm3z94XSeYf.png', 3, 1, '2026-10-07 21:48:38', '2026-10-08 07:08:40', '[{\"name\": \"Ubiquiti\", \"path\": \"seed/SU2guexxyD34vGH2xOvcbbwWh8dzr1YgtrJ3uZgU.png\"}]'),
(15, 'certification', NULL, 'Cisco CCNA', 'Cisco Certified Network Associate: fundamentos de redes, conectividad IP y seguridad.', NULL, NULL, NULL, 'seed/x0cbyYEBwklrIjtgajwpb54RmCN9UXDRN8EiIBPd.png', 0, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(16, 'certification', NULL, 'Huawei HCIA', 'Huawei Certified ICT Associate en Routing & Switching.', NULL, NULL, NULL, 'seed/DcBfJUqDTFhLIgDELo4ePanKqrI0Dir0tN8QaMXp.png', 1, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(17, 'certification', NULL, 'VMware Certified Professional', 'VMware Certified Professional en Data Center Virtualization (2023).', NULL, NULL, NULL, 'seed/VPwv0uIWBxkfCQPy9UKdxCoz5rCqYa2VWRQhHRFu.png', 2, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(18, 'certification', NULL, 'Fortinet Network Security Expert 4', 'Fortinet Network Security Expert, nivel 4 (NSE 4).', NULL, NULL, NULL, 'seed/k1PRPQFJgP3DV5qOVpzm1TQ5ORIoAvnEC46IOY9Y.png', 3, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(19, 'certification', NULL, 'Veeam Certified Engineer', 'Veeam Certified Engineer (2023): respaldo y recuperación de datos.', NULL, NULL, NULL, 'seed/QoTb2t7zTNl6k9q2y1KkG9RcTcxKfgTa8dRxkEd7.png', 4, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(20, 'certification', NULL, 'Microsoft Certified Fundamentals', 'Microsoft Certified: Fundamentals.', NULL, NULL, NULL, 'seed/GMhiUhYZDi5Tgiyg2REsQarGE7fx3gTXVAAX5Lrl.png', 5, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(21, 'certification', NULL, 'AudioCodes Certified Associate', 'AudioCodes Certified Associate (ACA).', NULL, NULL, NULL, 'seed/pYN0vg4K2z2EwsWamiOIjY53oEfDvVYdMTi9MUZQ.png', 6, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(22, 'certification', NULL, 'Sophos Certified Architect', 'Sophos Certified Architect en Central Endpoint and Server.', NULL, NULL, NULL, 'seed/o9F9mHNP3EnVfza6bWUe1pJYZAH6dICvGt3oa5zI.png', 7, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(23, 'client', NULL, 'Minera Titán del Perú', 'Redes, comunicaciones y seguridad en oficinas, plantas y campamentos mineros; hoy con outsourcing en ciberseguridad, networking y comunicaciones.', NULL, NULL, NULL, 'seed/FdqsTFOvZ0PDwio3zjfic8br7SnAZkchYbcyOus8.png', 0, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(24, 'client', NULL, 'SENATI', 'Plataforma de comunicaciones unificadas en más de 120 sedes.', NULL, NULL, NULL, 'seed/KLUa79dTBvd44jAbdNZVVnjpnEkJrQ8MPSlTAaQc.png', 1, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(25, 'client', NULL, 'Universidad Nacional de Ingeniería', NULL, NULL, NULL, NULL, 'seed/c4pFujfZSwHuVhi5xddCeXWKu4idwtS81CiDqQoG.png', 2, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(26, 'client', NULL, 'Innova ITC', 'Homologación de routers ONE ACCESS para Telefónica.', NULL, NULL, NULL, 'seed/Zr2mf1egLev2cGjG0rgTSP6arDjertuEelbldlwQ.png', 3, 0, '2026-10-07 21:48:38', '2026-10-26 18:14:00', NULL),
(27, 'client', NULL, 'Minera Croacia', NULL, NULL, NULL, NULL, 'seed/FEEt9ZZigbsOO1C87UHcKS4rQpOpa0s61XWKEMVW.png', 4, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(28, 'client', NULL, 'Minera Shouxin Perú', NULL, NULL, NULL, NULL, 'seed/8eobJnIlI6YYr8uJFoM4y9VIKygOjs2dPQfckqu5.png', 5, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(29, 'client', NULL, 'Incalpaca', NULL, NULL, NULL, NULL, 'seed/aEQFj1l5YfcHXIaCG6LjSfn7Xli993ZZHzukte4y.png', 6, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(30, 'client', NULL, 'Terpel', NULL, NULL, NULL, NULL, 'seed/yAFhw7ebidiS43dqRxIQbAmYDgAcujB98pfqOhGg.png', 7, 0, '2026-10-07 21:48:38', '2026-10-26 18:14:19', NULL),
(31, 'client', NULL, 'Acceso Crédito Vehicular', NULL, NULL, NULL, NULL, 'seed/ouVHo2sWOBNBTahQdAULUQOfNTNN8M9LR8I9BBRq.png', 8, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(32, 'client', NULL, 'Boticas y Salud', NULL, NULL, NULL, NULL, 'seed/hclCWjtLwAc12EVtdw9a83t9KM4Y51kl8fK3O7k8.png', 9, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(33, 'client', NULL, 'SuperPet', NULL, NULL, NULL, NULL, 'seed/ihaUqTh0f5i9HD0mbhUdp07uY6l9XkTabuTmFi2i.png', 10, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(34, 'client', NULL, 'Sokso', NULL, NULL, NULL, NULL, 'seed/3wfwspT5eALeQHLi457nTvHE9e0cWf5wlHkoVGMv.png', 11, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(35, 'client', NULL, 'Saturno', NULL, NULL, NULL, NULL, 'seed/fwgapgEB15OOj7UPjpSnLfpwHGltz1h7zntNpj6Q.png', 12, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(36, 'client', NULL, 'Menorca', NULL, NULL, NULL, NULL, 'seed/CTJgHVj4xUNq8Dym3Jb1GsD3rEVGKTdJShnbcpwF.png', 13, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(37, 'client', NULL, 'Recolecc', NULL, NULL, NULL, NULL, 'seed/vZmamPdvx6FNZBOiLR51FLUHBjKhgTPqSKrTIig2.png', 14, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(38, 'client', NULL, 'CENS', NULL, NULL, NULL, NULL, 'seed/asXoCiwO0J9O4jEyO1iwnnfDJj5eoKEQFLN7OvLB.png', 15, 0, '2026-10-07 21:48:38', '2026-10-26 18:14:19', NULL),
(39, 'client', NULL, 'IPSecc', NULL, NULL, NULL, NULL, 'seed/V00HZ6N9UvzHCycbP6Uv7saFj2AyoodOSjeUSI9M.png', 16, 0, '2026-10-07 21:48:38', '2026-10-26 18:14:19', NULL),
(40, 'client', NULL, 'AGP eGlass', NULL, NULL, NULL, NULL, 'seed/zTFzxMHZ9lhPQyrfuTCGJBjnLyN3IONpQZl7GHXs.png', 17, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(41, 'client', NULL, 'Colegio María de los Ángeles', 'Red Wi-Fi con más de 30 puntos de acceso para aulas híbridas.', NULL, NULL, NULL, 'seed/STkTaaAa9n8eoRZsbbEXzk95RLNPRWShLYScF7bT.png', 18, 1, '2026-10-07 21:48:38', '2026-10-24 00:55:27', NULL),
(42, 'client', NULL, 'Enotria', NULL, NULL, NULL, NULL, 'seed/4DglB6QHvZZEFMsU0fAhfaq6010y4lBELtQ53Ima.png', 19, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(43, 'client', NULL, 'Panorama BPO', NULL, NULL, NULL, NULL, 'seed/DXPgsr9mx8G5yhiPVTgmZWc5cIfQKTpczczsBUir.png', 20, 1, '2026-10-07 21:48:38', '2026-10-07 21:48:38', NULL),
(44, 'telcos_service', NULL, 'Consultoría e Ingeniería de Preventa', 'Brindamos soporte de ingeniería especializada para diseñar, evaluar y dimensionar soluciones TIC que respondan a los requerimientos de cada proyecto.', '[{\"title\":\"Dise\\u00f1o de arquitecturas\",\"description\":\"Dise\\u00f1o de soluciones de networking, infraestructura TI y ciberseguridad.\"},{\"title\":\"Evaluaci\\u00f3n y dimensionamiento\",\"description\":\"An\\u00e1lisis de requerimientos, factibilidad t\\u00e9cnica y capacidad de infraestructura.\"},{\"title\":\"Asesoramiento t\\u00e9cnico\",\"description\":\"Recomendaciones tecnol\\u00f3gicas, compatibilidad de soluciones y mejores pr\\u00e1cticas.\"}]', NULL, NULL, 'telcos_service/f061abd850b6f89d.png', 0, 1, '2026-10-12 22:35:21', '2026-11-25 11:58:01', NULL),
(45, 'telcos_service', NULL, 'Despliegue y Servicios de Campo', 'Brindamos personal técnico especializado para instalaciones, despliegues y trabajos de infraestructura TIC.', '[{\"title\":\"Cableado y fibra \\u00f3ptica\",\"description\":\"Instalaci\\u00f3n, empalme, certificaci\\u00f3n y medici\\u00f3n de enlaces.\"},{\"title\":\"Instalaci\\u00f3n de infraestructura\",\"description\":\"Montaje de equipos de red, gabinetes y sistemas tecnol\\u00f3gicos.\"},{\"title\":\"Levantamientos t\\u00e9cnicos\",\"description\":\"Inspecciones, inventarios, factibilidad y documentaci\\u00f3n de campo.\"}]', NULL, NULL, 'telcos_service/0285b07d4c38f23a.jpg', 2, 1, '2026-10-12 22:35:21', '2026-11-25 11:58:01', NULL),
(46, 'telcos_service', NULL, 'Ciberseguridad Especializada', 'Complementamos la capacidad técnica de nuestros socios con servicios de implementación y fortalecimiento de la seguridad tecnológica.', '[{\"title\":\"Seguridad de red\",\"description\":\"Implementaci\\u00f3n de firewalls, VPN y segmentaci\\u00f3n de redes.\"},{\"title\":\"Fortalecimiento de sistemas\",\"description\":\"Configuraci\\u00f3n segura, hardening y optimizaci\\u00f3n de plataformas.\"},{\"title\":\"Evaluaci\\u00f3n de seguridad\",\"description\":\"Revisi\\u00f3n de configuraciones, identificaci\\u00f3n de riesgos y mejoras.\"}]', NULL, NULL, 'telcos_service/d2d052b3fdafdcb8.jpg', 3, 1, '2026-10-12 22:35:21', '2026-11-25 11:58:01', NULL),
(47, 'telcos_value', NULL, 'Confidencialidad comercial', 'Respetamos tu cartera de clientes, tu identidad corporativa y la confidencialidad de cada proyecto.', NULL, NULL, NULL, 'telcos_value/04575471df535c93.jpg', 1, 1, '2026-10-12 22:35:21', '2026-11-25 12:34:23', NULL),
(48, 'telcos_value', NULL, 'Especialización técnica', 'Aportamos experiencia en ingeniería, implementación y soporte de soluciones TIC.', NULL, NULL, NULL, 'telcos_value/a0a50375185fee33.webp', 2, 1, '2026-10-12 22:35:21', '2026-11-25 12:34:23', NULL),
(49, 'telcos_value', NULL, 'Flexibilidad operativa', 'Nos adaptamos a los alcances, recursos y plazos de cada proyecto, según tus necesidades.', NULL, NULL, NULL, 'telcos_value/626d2756f2a4d742.webp', 3, 1, '2026-10-12 22:35:21', '2026-11-25 12:34:23', NULL),
(50, 'telcos_block', NULL, 'Ingeniería que respalda tus proyectos', 'Acompañamos a integradores y operadores durante la ejecución de sus proyectos TIC, aportando capacidad técnica especializada, coordinación y cumplimiento de los entregables.\r\n\r\nPlanificación técnica: Definimos alcances, recursos y actividades según los requerimientos del proyecto.\r\n\r\nEjecución coordinada: Trabajamos de forma articulada con los equipos técnicos de nuestros socios.\r\n\r\nEntrega documentada: Realizamos las validaciones y entregamos la documentación técnica correspondiente.', NULL, '/experiencia', 'Ver casos de éxito', 'telcos_block/31f9d46c2cfc9394.jpg', 0, 1, '2026-10-12 22:42:34', '2026-11-25 12:41:41', NULL),
(53, 'telcos_service', NULL, 'Implementación e Integración TIC', 'Ejecutamos proyectos tecnológicos para integradores y operadores, desde la configuración hasta la puesta en producción.', '[{\"title\":\"Configuraci\\u00f3n de soluciones\",\"description\":\"Implementaci\\u00f3n de redes, servidores, plataformas y sistemas TIC.\"},{\"title\":\"Migraci\\u00f3n e integraci\\u00f3n\",\"description\":\"Migraci\\u00f3n tecnol\\u00f3gica e integraci\\u00f3n con infraestructuras existentes.\"},{\"title\":\"Pruebas y puesta en marcha\",\"description\":\"Validaci\\u00f3n funcional, homologaci\\u00f3n y documentaci\\u00f3n t\\u00e9cnica.\"}]', NULL, NULL, 'telcos_service/7fe153b7953de4f2.jpg', 1, 1, '2026-11-25 11:58:01', '2026-11-25 12:10:19', NULL),
(54, 'telcos_service', NULL, 'Soporte Técnico Especializado', 'Brindamos asistencia técnica avanzada para resolver incidencias, optimizar plataformas y garantizar la estabilidad operativa.', '[{\"title\":\"Diagn\\u00f3stico avanzado\",\"description\":\"An\\u00e1lisis y resoluci\\u00f3n de incidencias complejas de infraestructura TIC.\"},{\"title\":\"Optimizaci\\u00f3n tecnol\\u00f3gica\",\"description\":\"Actualizaci\\u00f3n, ajustes de rendimiento y mejoras de configuraci\\u00f3n.\"},{\"title\":\"Soporte por demanda\",\"description\":\"Asistencia especializada remota o presencial para proyectos TIC.\"}]', NULL, NULL, 'telcos_service/b50a6f8454669906.jpg', 4, 1, '2026-11-25 11:58:01', '2026-11-25 11:58:01', NULL),
(61, 'telcos_value', NULL, 'Tu marca, nuestra ingeniería', 'Actuamos como parte de tu equipo, representando a tu empresa frente al cliente final.', NULL, NULL, NULL, 'telcos_value/8fc54c056771b5f0.webp', 0, 1, '2026-11-25 12:41:45', '2026-11-25 12:43:54', NULL),
(71, 'solution', 'data-center-y-energia', 'Data Center y Energía', 'Integramos infraestructura crítica para alojar, proteger y garantizar la continuidad operativa de los sistemas tecnológicos empresariales.', '[{\"title\":\"Data Centers modulares\",\"description\":\"Micro Data Centers y gabinetes autocontenidos.\"},{\"title\":\"Racks e infraestructura f\\u00edsica\",\"description\":\"Gabinetes TI y acondicionamiento de salas t\\u00e9cnicas.\"},{\"title\":\"Energ\\u00eda y respaldo el\\u00e9ctrico\",\"description\":\"UPS, bancos de bater\\u00edas y sistemas de continuidad.\"},{\"title\":\"Climatizaci\\u00f3n de precisi\\u00f3n\",\"description\":\"Refrigeraci\\u00f3n y control t\\u00e9rmico de infraestructura cr\\u00edtica.\"},{\"title\":\"Distribuci\\u00f3n el\\u00e9ctrica\",\"description\":\"PDU, ATS y sistemas de distribuci\\u00f3n y protecci\\u00f3n.\"},{\"title\":\"DCIM y monitoreo ambiental\",\"description\":\"Supervisi\\u00f3n de energ\\u00eda, temperatura, capacidad y alarmas.\"}]', NULL, NULL, 'solution/e88091167ffc0d3f.jpg', 3, 1, '2026-11-25 14:22:33', '2026-11-25 14:45:13', '[{\"path\":\"brands\\/dc1c9d151d25b685.png\",\"name\":\"HUAWEI\"},{\"path\":\"brands\\/e12cb1170a94d5c8.jpg\",\"name\":\"VERTIV\"}]');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('2J9q1MeMTyOU9zAQFookXu15YxUnaDxhjFvb5zEH', NULL, '14.205.14.151', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJicmR2c2VBWHpSU3NCeDRta2F5aTBQV2F6R0NuYUUwZmU5U3JFaE5vIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC93d3cucHJvaW5ub3ZhdGVjLmNvbSIsInJvdXRlIjoiaG9tZSJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1795623486),
('a4v7FKWnR3j7134MM8ZsDZ9NceVui6zOgF9GPQ2j', NULL, '9.169.121.179', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiI2QXp3a2o5d2lkbHQwNjlGWER4NHByMk1mYkNuUGVXU0lVd3JQb3VQIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC93d3cucHJvaW5ub3ZhdGVjLmNvbSIsInJvdXRlIjoiaG9tZSJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1795626018),
('AehdFQlIt5Q23cGTdnTs9djNu4pHQTEyfSorGDtV', NULL, '95.31.168.194', 'python-requests/2.32.3', 'eyJfdG9rZW4iOiJERXdocFUzMXZVTVVRODFQZENWTUxtdkxMdUc1Q3J4S2U0SmxldGVxIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC9wcm9pbm5vdmF0ZWMuY29tIiwicm91dGUiOiJob21lIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1795628307),
('crH1Na6zGvuTIbAUrldAhtxZdEfrzkr6k2k2IK7q', 1, '38.25.85.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJrZnpmV0NLZTgwNWJOOXF1elZuVmo3QWp2QWxhQlpBeW9QODQ2aUxiIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1795625251),
('e91OiWSVj6229ZMAESUt6WnJLLyIfP3dSN2kmV1e', NULL, '113.31.186.197', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11) AppleWebKit/601.1.27 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/601.1.27', 'eyJfdG9rZW4iOiJOV2lraTVmTW9aVFY4WW9xQVVrVkZma1lIbHlKS3FFYzlTa2xESVduIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC9wcm9pbm5vdmF0ZWMuY29tIiwicm91dGUiOiJob21lIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1795628590),
('kqt1wo9FB10AsiGY1eDy4V7b6MPBUzv5I5LWsE2n', NULL, '185.227.218.71', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJIeDVrdmlOaEtOYUZ4ZWVuN1hIMHdRaUtmWUxWWmtqa2pTdTNNdFZCIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC9wcm9pbm5vdmF0ZWMuY29tIiwicm91dGUiOiJob21lIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1795623999),
('o6PKmeJ2cu7g2dCjNHHn15t0l8LlQ6yrQgtmNLYk', NULL, '74.179.67.135', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJqUG9odEMybUNoVGdlRHNNY3g1RERpZ1FvQUVoTGM2dFVleGZSZ01QIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC93d3cucHJvaW5ub3ZhdGVjLmNvbSIsInJvdXRlIjoiaG9tZSJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1795625584),
('owWIdNPbb6AqD787C6wbtSueB10Bes24A0eoFj8R', NULL, '111.41.167.242', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiIzNzRDa0kzMUZibTlYZHp5MkxwUFV6UURxS0dmVFYzNGM1VUJuazZzIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC93d3cucHJvaW5ub3ZhdGVjLmNvbSIsInJvdXRlIjoiaG9tZSJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1795623490),
('SV0BW7CHECa4cG1v3fjLhM9iqYTAY1LsCk9ly9P4', NULL, '216.73.216.159', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)', 'eyJfdG9rZW4iOiJlbHA1QjJOYWEzVnE3d1YwMkJHM1huS0JwUmM0VGdTMUFUbUNLOEZhIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC9wcm9pbm5vdmF0ZWMuY29tIiwicm91dGUiOiJob21lIn0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1795621000),
('UjUu1pNruNdYGSlY4PxPrvqjSPpyGRHau1bQFSgn', NULL, '38.25.85.126', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/158.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJEVGlSdFNCeGhtUTdiWVpSZGpkMzhNRTlTZ0JubzhlRlpyY21DOE1RIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC93d3cucHJvaW5ub3ZhdGVjLmNvbSIsInJvdXRlIjoiaG9tZSJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1795626073);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` bigint(20) UNSIGNED DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `two_factor_secret` text DEFAULT NULL,
  `two_factor_recovery_codes` text DEFAULT NULL,
  `two_factor_confirmed_at` timestamp NULL DEFAULT NULL,
  `two_factor_last_step` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `role_id`, `active`, `remember_token`, `created_at`, `updated_at`, `two_factor_secret`, `two_factor_recovery_codes`, `two_factor_confirmed_at`, `two_factor_last_step`) VALUES
(1, 'Administrador', 'admin@proinnovatec.local', NULL, '$2y$12$yXaQmcJHt5YJhnhtL1noFuQbH1vMKxPMkv7wOz5BPmWXPQA2LN7hq', 1, 1, NULL, '2026-10-07 06:07:16', '2026-10-07 06:07:16', NULL, NULL, NULL, NULL),
(2, 'mario', 'Mario@pruebas.com', NULL, '$2y$12$ulWzXE/bASAHiczinRTgDOotNwdGdWOGrg2PnjadS9Kz/x.ehRe0a', 3, 1, NULL, '2026-10-22 18:43:03', '2026-10-22 18:43:03', NULL, NULL, NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `blog_categories_slug_unique` (`slug`) USING BTREE;

--
-- Indices de la tabla `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `blog_posts_slug_unique` (`slug`) USING BTREE,
  ADD KEY `blog_posts_blog_category_id_foreign` (`blog_category_id`) USING BTREE,
  ADD KEY `blog_posts_published_at_index` (`published_at`) USING BTREE;

--
-- Indices de la tabla `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`) USING BTREE,
  ADD KEY `cache_expiration_index` (`expiration`) USING BTREE;

--
-- Indices de la tabla `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`) USING BTREE,
  ADD KEY `cache_locks_expiration_index` (`expiration`) USING BTREE;

--
-- Indices de la tabla `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `contact_messages_read_at_index` (`read_at`) USING BTREE;

--
-- Indices de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`) USING BTREE,
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`) USING BTREE;

--
-- Indices de la tabla `home_settings`
--
ALTER TABLE `home_settings`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indices de la tabla `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `jobs_queue_index` (`queue`) USING BTREE;

--
-- Indices de la tabla `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indices de la tabla `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`) USING BTREE;

--
-- Indices de la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`) USING BTREE;

--
-- Indices de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`) USING BTREE,
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`) USING BTREE,
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`) USING BTREE;

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `roles_name_unique` (`name`) USING BTREE,
  ADD UNIQUE KEY `roles_slug_unique` (`slug`) USING BTREE;

--
-- Indices de la tabla `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission`) USING BTREE;

--
-- Indices de la tabla `section_items`
--
ALTER TABLE `section_items`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `section_items_section_index` (`section`) USING BTREE;

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD KEY `sessions_user_id_index` (`user_id`) USING BTREE,
  ADD KEY `sessions_last_activity_index` (`last_activity`) USING BTREE;

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `users_email_unique` (`email`) USING BTREE,
  ADD KEY `users_role_id_foreign` (`role_id`) USING BTREE;

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `home_settings`
--
ALTER TABLE `home_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `section_items`
--
ALTER TABLE `section_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD CONSTRAINT `blog_posts_blog_category_id_foreign` FOREIGN KEY (`blog_category_id`) REFERENCES `blog_categories` (`id`);

--
-- Filtros para la tabla `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
