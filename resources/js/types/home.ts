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
    title: string;
    summary: string | null;
    rows: OfferingRow[];
};

export type SiteSections = {
    about: {
        title: string;
        accent: string;
        body: string;
        cards: { id: number; label: string; url: string; imageUrl: string | null }[];
    };
    solutions: { title: string; intro: string; items: Offering[] };
    services: { title: string; intro: string; items: Offering[] };
    experience: {
        title: string;
        intro: string;
        bgUrl: string | null;
        cases: { id: number; client: string; summary: string | null }[];
        certifications: { id: number; name: string; imageUrl: string | null }[];
    };
    clients: {
        title: string;
        accent: string;
        items: { id: number; name: string; logoUrl: string | null }[];
    };
    contact: {
        title: string;
        body: string;
        email: string;
        phone: string;
        address: string;
        website: string;
    };
    footer: { tagline: string };
};
