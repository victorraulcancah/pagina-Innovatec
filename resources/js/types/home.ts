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
        imageUrl: string | null;
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
        imageUrl: string | null;
    };
    footer: { tagline: string };
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
