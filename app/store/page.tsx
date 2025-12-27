'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function StoreThemeSelection() {
    const router = useRouter();

    return (
        <div className="theme-selection-page">
            <header className="theme-selection-header">
                <Image src="/logo.png" alt="GrabMeShoe" width={120} height={40} style={{ objectFit: 'contain' }} />
            </header>

            <main className="theme-selection-main">
                <h1 className="theme-selection-title">Choisissez votre thème</h1>
                <p className="theme-selection-subtitle">Sélectionnez le style qui correspond à votre boutique</p>

                <div className="theme-selection-grid">
                    <div className="theme-card" onClick={() => router.push('/store/theme-1')}>
                        <div className="theme-preview theme-1-preview">
                            <Image src="/theme-1.png" alt="Theme 1" width={300} height={500} style={{ objectFit: 'cover' }} />
                        </div>
                        <div className="theme-card-info">
                            <h3>Thème 1</h3>
                            <p>Élégant et moderne</p>
                        </div>
                    </div>

                    <div className="theme-card" onClick={() => router.push('/store/theme-2')}>
                        <div className="theme-preview theme-2-preview">
                            <Image src="/theme-2.png" alt="Theme 2" width={300} height={500} style={{ objectFit: 'cover' }} />
                        </div>
                        <div className="theme-card-info">
                            <h3>Thème 2</h3>
                            <p>Coloré et joyeux</p>
                        </div>
                    </div>

                    <div className="theme-card" onClick={() => router.push('/store/theme-3')}>
                        <div className="theme-preview theme-3-preview">
                            <Image src="/theme-3.png" alt="Theme 3" width={300} height={500} style={{ objectFit: 'cover' }} />
                        </div>
                        <div className="theme-card-info">
                            <h3>Thème 3</h3>
                            <p>Sombre et sophistiqué</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}



