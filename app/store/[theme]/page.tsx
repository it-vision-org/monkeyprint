'use client';

import { useParams } from 'next/navigation';
import ThemeStorePage from '@/components/ThemeStorePage';
import { themeConfigs } from '@/components/themeConfig';
import { themeHomePageData } from '@/lib/constants/themeData';

export default function ThemePage() {
    const params = useParams();
    const themeId = params.theme as string;
    const theme = themeConfigs[themeId];
    const themeData = themeHomePageData[themeId];

    if (!theme || !themeData) {
        return <div>Theme not found</div>;
    }

    return (
        <ThemeStorePage
            theme={theme}
            products={themeData.products}
            heroContent={themeData.heroContent}
            categories={themeData.categories}
            sections={themeData.sections}
        />
    );
}

