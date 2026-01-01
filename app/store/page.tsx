'use client';

import { useRouter } from 'next/navigation';
import Image from "next/image";
import { themeConfigs } from '@/components/themeConfig';

const themeMetadata: Record<string, { name: string; description: string; preview: string }> = {
    'theme-1': {
        name: 'Thème 1',
        description: 'Élégant et moderne',
        preview: '/theme-1.png'
    },
    'theme-2': {
        name: 'Thème 2',
        description: 'Coloré et joyeux',
        preview: '/theme-2.png'
    },
    'theme-3': {
        name: 'Thème 3',
        description: 'Sombre et sophistiqué',
        preview: '/theme-3.png'
    }
};

export default function StoreThemeSelection() {
    const router = useRouter();
    const availableThemes = Object.keys(themeConfigs);

    return (
        <div className="theme-selection-page">
            <header className="theme-selection-header">
                <Image src="/logo.png" alt="Logo" width={120} height={40} style={{ objectFit: 'contain' }} />
            </header>

            <main className="theme-selection-main">
                <h1 className="theme-selection-title">Choisissez votre thème</h1>
                <p className="theme-selection-subtitle">Sélectionnez le style qui correspond à votre boutique</p>

                <div className="theme-selection-grid">
                    {availableThemes.map((themeId) => {
                        const metadata = themeMetadata[themeId] || {
                            name: themeId,
                            description: 'Thème personnalisé',
                            preview: '/theme-1.png'
                        };
                        return (
                            <div key={themeId} className="theme-card" onClick={() => router.push(`/store/${themeId}`)}>
                                <div className={`theme-preview ${themeId}-preview`}>
                                    <Image 
                                        src={metadata.preview} 
                                        alt={metadata.name} 
                                        width={300} 
                                        height={500} 
                                        style={{ objectFit: 'cover' }} 
                                    />
                                </div>
                                <div className="theme-card-info">
                                    <h3>{metadata.name}</h3>
                                    <p>{metadata.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}



