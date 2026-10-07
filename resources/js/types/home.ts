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
};
