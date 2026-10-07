# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: Laravel 13 + Inertia 3 + React 19 + TypeScript + Tailwind CSS 4 (Vite). SQLite in development. Admin authentication via JWT (php-open-source-saver/jwt-auth, chosen by the user).

## Users

- Visitors: companies and institutions in Peru (mining, telecom, education, enterprise IT buyers) evaluating an ICT integrator.
- Administrator: a non-technical staff member at PROINNOVATEC who edits the public site without a developer.

## Product Purpose

Corporate website for PROINNOVATEC by Grupo CAME, an ICT integrator with 10+ years of experience and manufacturer certifications. The site presents the company and its services and turns visitors into contacts. It must be administrable: staff change content from a panel, not from code. First version is basic: the home page only.

## Positioning

An integrator that covers six ICT lines under one roof (unified communications, cybersecurity, networking, IT infrastructure, professional services, electronic security) and backs them with real technical cases (Cisco standardization for a mining client, Telefonica router homologation via INOOVA ITC).

## Operating Context

Spanish-language site. Content comes from the brochure "Brochure PROINNOVATEC by Grupo CAME v2.pdf" at the project root (15 pages: Quienes Somos, Nuestros Servicios, six service lines with sub-solutions, Consultoria / Help Desk / Outsourcing TIC, clients, technical experience cases).

## Capabilities and Constraints

- v1 scope: home page only. The administrator edits: hero background video, headline, subtitle, buttons (label and link), and navigation menu items.
- Home layout is pinned by a user-supplied reference screenshot: full-viewport looping background video, semi-transparent navigation bar over the video, headline and call-to-action buttons overlaid on the video.
- Admin login uses JWT.
- The user will supply the final video (mp4) and the logo; until then both are placeholders and must be marked as such.
- Later versions: Nosotros, Soluciones (service lines), Blog, Contactanos pages.

## Brand Commitments

Name: PROINNOVATEC by Grupo CAME. Tone: technical, confident, Spanish. Logo supplied later by the user.

## Evidence on Hand

Brochure PDF (text extracted: services, sub-solutions, two technical cases). Client logos are inside the PDF as images and were not extracted. No testimonials, metrics beyond "mas de 10 anos de experiencia", or pricing exist; do not fabricate any.

## Product Principles

1. The administrator can change what visitors see without touching code.
2. Only claims from the brochure appear on the site.
3. The first screen states what the company does and offers one clear action.
4. Start small: ship the editable home, then add sections.

## Accessibility & Inclusion

Video background must not carry meaning alone: text over it keeps readable contrast, motion respects prefers-reduced-motion, and the video is muted with a poster fallback.
