'use client';

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductDetailsPage() {
	const router = useRouter();
	const [productPrice, setProductPrice] = useState("25");
	const [selectedGenders, setSelectedGenders] = useState<string[]>(["Homme"]);
	const [tags, setTags] = useState([
		"Sport", "Travel", "Kids", "Streetwear", "Hip hop", "Music", "Brands"
	]);
	const [selectedTags, setSelectedTags] = useState<string[]>(["Streetwear", "Music"]);
	const [design, setDesign] = useState<string | null>(null);

	useEffect(() => {
		const savedDesign = sessionStorage.getItem('uploadedDesign');
		if (savedDesign) {
			setDesign(savedDesign);
		}
	}, []);

	const toggleGender = (gender: string) => {
		setSelectedGenders(prev =>
			prev.includes(gender)
				? prev.filter(g => g !== gender)
				: [...prev, gender]
		);
	};

	const toggleTag = (tag: string) => {
		setSelectedTags(prev =>
			prev.includes(tag)
				? prev.filter(t => t !== tag)
				: [...prev, tag]
		);
	};

	const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setProductPrice(value);
	};

	const handlePriceBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(e.target.value);
		if (value < 25) {
			setProductPrice("25");
		}
	};

	const revenue = (parseFloat(productPrice) || 0) - 20;

	return (
		<div className="pd-page">
			{/* Header */}
			<header style={{ borderBottom: "1px solid #e5e7eb", background: "white" }}>
				<div className="mp-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 80, padding: "0 20px" }}>
					<div style={{ display: "flex", alignItems: "center", gap: 32 }}>
						<Image src="/logo.png" alt="Monkey Print" width={120} height={40} style={{ objectFit: "contain" }} />
						<nav className="mp-desktop-nav" style={{ display: "flex", gap: 32, fontWeight: 600, color: "#0d9488", fontSize: 15 }}>
							<a href="/" style={{ textDecoration: "none", color: "#0d9488" }}>ACCUEIL</a>
							<a href="#" style={{ textDecoration: "none", color: "#0d9488" }}>SHOP LIST</a>
							<a href="#" style={{ textDecoration: "none", color: "#0d9488" }}>CONTACTEZ-NOUS</a>
						</nav>
					</div>
					<div className="mp-desktop-nav">
						<button style={{ 
							width: 48, height: 48, borderRadius: '50%', background: '#0d9488', border: 'none', cursor: 'pointer',
							display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 700
						}}>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						</button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="pd-main">
				<div className="pd-container">
					<div className="pd-content">
						<h1 className="pd-title">Dernière étape, remplissez<br/>la description de votre produit</h1>
						<div className="pd-title-hr" />

						<div className="pd-image-box">
							<div className="pu-design-preview-shirt">
								<Image 
									src="/T-Shirt-Design.png" 
									alt="Shirt Preview" 
									width={300} 
									height={350}
									style={{ objectFit: 'contain' }}
								/>
								{design && (
									<div className="pu-design-overlay">
										<Image 
											src={design} 
											alt="Design" 
											width={100} 
											height={100}
											style={{ objectFit: 'contain' }}
										/>
									</div>
								)}
							</div>
						</div>

						<label className="pd-label">Nom du produit :</label>
						<input className="pd-input" type="text" />

						<div className="pd-row">
							<div style={{ flex: 1 }}>
								<label className="pd-label">Prix du produit :</label>
								<input 
									className="pd-input" 
									type="number" 
									min="25"
									value={productPrice}
									onChange={handlePriceChange}
									onBlur={handlePriceBlur}
									placeholder="e.g., 100"
								/>
							</div>
							<div style={{ flex: 1 }}>
								<label className="pd-label">Votre revenu :</label>
								<div className="pd-revenue">
									{revenue > 0 ? `${revenue.toFixed(2)} TND` : '0 TND'}
								</div>
							</div>
						</div>

						<label className="pd-label">Description :</label>
						<textarea className="pd-textarea" />

						<div className="pd-field-block">
							<div className="pd-label" style={{ marginBottom: 8 }}>Sélectionner le sexe du produit :</div>
							<div className="pd-gender-select">
								{['Homme', 'Femme', 'Enfant'].map(gender => (
									<button
										key={gender}
										className={`pd-gender-btn ${selectedGenders.includes(gender) ? 'active' : ''}`}
										onClick={() => toggleGender(gender)}
									>
										{gender}
									</button>
								))}
							</div>
						</div>

						<div className="pd-field-block">
							<div className="pd-label" style={{ marginBottom: 8 }}>Sélectionner des étiquettes</div>
							<div className="pd-tags">
								{tags.map(tag => (
									<button 
										key={tag}
										className={`pd-tag ${selectedTags.includes(tag) ? 'pd-tag--active' : ''}`}
										onClick={() => toggleTag(tag)}
									>
										{tag}
									</button>
								))}
							</div>
						</div>
						
						<div className="pd-nav-buttons">
							<button className="pd-back-button" onClick={() => router.back()}>Précédent</button>
							<button className="pd-save">Enregistrer</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}


