export type HeroButton = {
    label: string;
    url: string;
    variant: 'primary' | 'outline';
};

export type MenuChild = { label: string; url: string };

export type MenuItem = MenuChild & { children: MenuChild[] };

export type HomeContent = {
    brandName: string;
    logoUrl: string;
    videoUrl: string | null;
    posterUrl: string | null;
    title: string;
    subtitle: string | null;
    buttons: HeroButton[];
    menu: MenuItem[];
    navCta: MenuChild | null;
    sections: SiteSections;
};

export type OfferingRow = { title: string; description: string | null };

export type Offering = {
    id: number;
    slug: string | null;
    url: string;
    title: string;
    summary: string | null;
    rows: OfferingRow[];
    imageUrl: string | null;
    gallery: { name: string; url: string }[];
};

export type SiteSections = {
    about: {
        title: string;
        accent: string;
        body: string;
        story: string;
        mission: string;
        vision: string;
        objectives: string;
        more_label: string;
        imageUrl: string | null;
        missionImageUrl: string | null;
        visionImageUrl: string | null;
        objectivesImageUrl: string | null;
        cards: { id: number; label: string; url: string; imageUrl: string | null }[];
    };
    solutions: { title: string; intro: string; imageUrl: string | null; items: Offering[] };
    services: { title: string; intro: string; imageUrl: string | null; items: Offering[] };
    experience: {
        title: string;
        intro: string;
        bgUrl: string | null;
        cases: {
            id: number;
            client: string;
            summary: string | null;
            imageUrl: string | null;
            gallery: { name: string; url: string }[];
        }[];
        certifications: { id: number; name: string; imageUrl: string | null }[];
    };
    clients: {
        title: string;
        accent: string;
        imageUrl: string | null;
        items: { id: number; name: string; logoUrl: string | null }[];
    };
    contact: {
        title: string;
        body: string;
        email: string;
        phone: string;
        address: string;
        website: string;
        whatsapp: string;
        hours: string;
        imageUrl: string | null;
    };
    enterprise: {
        title: string;
        subtitle: string;
        intro: string;
        cta_title: string;
        cta_label: string;
        cta_url: string;
        imageUrl: string | null;
    };
    telcos: {
        title: string;
        subtitle: string;
        intro: string;
        partner_title: string;
        partner_text: string;
        values_title: string;
        values_intro: string;
        cta_title: string;
        home_button_label: string;
        imageUrl: string | null;
        partnerImageUrl: string | null;
        services: { id: number; title: string; summary: string | null; points: string[]; imageUrl: string | null }[];
        blocks: { id: number; title: string; body: string | null; points: string[]; imageUrl: string | null; url: string | null; label: string | null }[];
        values: { id: number; title: string; body: string | null; imageUrl: string | null }[];
        gallery: { id: number; caption: string; imageUrl: string | null }[];
    };
    footer: { tagline: string; copyright: string };
    company: { name: string; legal_name: string; tax_id: string };
    social: { facebook: string; linkedin: string; instagram: string; youtube: string; tiktok: string };
};

export type BlogCard = {
    id: number;
    title: string;
    excerpt: string | null;
    url: string;
    coverUrl: string | null;
    category: { name: string; url: string };
    date: string | null;
};
