'use client';

import { useState, useRef, DragEvent } from 'react';
import Image from 'next/image';

interface ImageUploadZoneProps {
    onImageSelect: (file: File) => void;
    onImageRemove: () => void;
    selectedImage: string | null;
    imageFile: File | null;
    id?: string;
    label?: string;
}

export default function ImageUploadZone({ 
    onImageSelect, 
    onImageRemove, 
    selectedImage, 
    imageFile,
    id = 'image-upload',
    label = 'Image (optionnel)'
}: ImageUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndSetImage = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image valide');
            return false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert('L\'image est trop grande. Taille maximale: 5MB');
            return false;
        }
        onImageSelect(file);
        return true;
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetImage(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetImage(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    if (selectedImage) {
        return (
            <div className="support-image-upload-preview">
                <div className="support-image-preview-container">
                    <Image 
                        src={selectedImage} 
                        alt="Preview" 
                        width={300} 
                        height={300}
                        className="support-image-preview-img"
                    />
                    <button 
                        type="button"
                        onClick={onImageRemove}
                        className="support-remove-image-btn"
                        aria-label="Supprimer l'image"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
                <button
                    type="button"
                    onClick={handleClick}
                    className="support-change-image-btn"
                >
                    Changer l'image
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    id={id}
                    name="image"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="support-file-input-hidden"
                />
            </div>
        );
    }

    return (
        <div className="support-form-group">
            <label htmlFor={id}>{label}</label>
            <div
                className={`support-drag-drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    id={id}
                    name="image"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="support-file-input-hidden"
                />
                <div className="support-drag-drop-content">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="support-drag-drop-icon">
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="support-drag-drop-text">
                        <span className="support-drag-drop-main">Glissez-déposez une image ici</span>
                        <span className="support-drag-drop-sub">ou cliquez pour sélectionner</span>
                    </div>
                    <div className="support-drag-drop-hint">
                        PNG, JPG, GIF jusqu'à 5MB
                    </div>
                </div>
            </div>
        </div>
    );
}
