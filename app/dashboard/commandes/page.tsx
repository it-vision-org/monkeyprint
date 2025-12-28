'use client';

import Image from "next/image";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";

function CommandesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCommand, setSelectedCommand] = useState<number | null>(null);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState("11/06/2025");
    const [currentView, setCurrentView] = useState<'calendar' | 'month'>('calendar');
    const [currentMonth, setCurrentMonth] = useState(new Date(2023, 3, 1)); // April 2023
    const [currentYear, setCurrentYear] = useState(2023);
    
    const status = searchParams.get('status') || null;

    const orders = Array(4).fill({
        id: "#1",
        date: "10/31/2025",
        name: "Mohammed Ammar",
        address: "Sfax Rue Tunis 3.2klm",
        number: "12345678",
        total: "150DT"
    });

    const getStatusConfig = () => {
        switch(status) {
            case 'confirme':
                return {
                    title: 'Liste de commandes confirmé',
                    icon: 'check'
                };
            case 'retours':
                return {
                    title: 'Liste de commandes retourné',
                    icon: 'none',
                    showAlert: true
                };
            case 'non-confirme':
                return {
                    title: 'Liste de commandes non confirmé',
                    icon: 'check'
                };
            default:
                return {
                    title: 'Liste de commandes',
                    icon: 'check'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div className="commandes-page">
            <div className="commandes-main">
                <div className="commandes-container">
                    <div className="commandes-status-tabs">
                        <Link
                            href="/dashboard/commandes?status=non-confirme"
                            className={`commandes-status-tab orange ${status === 'non-confirme' ? 'active' : ''}`}
                        >
                            <span className="dash-submenu-dot orange"></span>
                            Non confirmé
                        </Link>
                        <Link
                            href="/dashboard/commandes?status=confirme"
                            className={`commandes-status-tab green ${status === 'confirme' ? 'active' : ''}`}
                        >
                            <span className="dash-submenu-dot green"></span>
                            Confirmé
                        </Link>
                        <Link
                            href="/dashboard/commandes?status=retours"
                            className={`commandes-status-tab red ${status === 'retours' ? 'active' : ''}`}
                        >
                            <span className="dash-submenu-dot red"></span>
                            Retours
                        </Link>
                    </div>

                    <div className="commandes-header">
                        <h1 className="commandes-title">
                            {config.title}
                            {status === 'confirme' && (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="title-check">
                                    <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </h1>
                    </div>

                    {config.showAlert && (
                        <div className="commandes-alert">
                            Les articles retournés revendus vous feront gagner le montant total du produit !
                        </div>
                    )}

                    <div className="commandes-search-bar">
                        <div className="commandes-search">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M21 21L16.65 16.65" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <input type="text" placeholder="Rechercher" />
                        </div>
                        <button className="commandes-sort-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 8L12 3L17 8M7 16L12 21L17 16" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        <div className="commandes-date" onClick={() => setDatePickerOpen(true)}>{selectedDate}</div>
                    </div>

                    <div className="commandes-list">
                        {orders.map((order, index) => (
                            <div key={index} className="commande-card">
                                <div className="commande-card-header">
                                    <div className="commande-id">{order.id}</div>
                                    <div className="commande-header-right">
                                        <div className="commande-date">{order.date}</div>
                                        <div className="commande-actions">
                                            {status !== 'retours' && (
                                                <button className="commande-delete-btn" onClick={() => {
                                                    setSelectedCommand(index);
                                                    setDeleteDialogOpen(true);
                                                }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M3 6H5H21" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            )}
                                            {config.icon === 'check' && (
                                                <button className={`commande-check-btn ${status === 'confirme' ? 'confirmed' : ''}`}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="commande-card-body">
                                    <div className="commande-row">
                                        <div className="commande-label">Nom</div>
                                        <div className="commande-value">{order.name}</div>
                                    </div>
                                    <div className="commande-row">
                                        <div className="commande-label">Adress</div>
                                        <div className="commande-value">{order.address}</div>
                                    </div>
                                    <div className="commande-row">
                                        <div className="commande-label">Numero</div>
                                        <div className="commande-value">{order.number}</div>
                                    </div>
                                    <div className="commande-row">
                                        <div className="commande-label">Total</div>
                                        <div className="commande-total">{order.total}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="commandes-pagination">
                        <button className="commandes-pagination-btn">
                            &lt; Précédent
                        </button>
                        <div className="commandes-pagination-numbers">
                            <button className="commandes-pagination-number">1</button>
                            <button className="commandes-pagination-number active">2</button>
                            <button className="commandes-pagination-number">3</button>
                        </div>
                        <button className="commandes-pagination-btn">
                            Suivant &gt;
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete Dialog */}
            {deleteDialogOpen && (
                <div className="delete-dialog-overlay" onClick={() => setDeleteDialogOpen(false)}>
                    <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
                        <p className="delete-dialog-text">Êtes-vous sûr de vouloir supprimer cette commande ?</p>
                        <div className="delete-dialog-actions">
                            <button className="delete-dialog-btn confirm" onClick={() => setDeleteDialogOpen(false)}>NON</button>
                            <button className="delete-dialog-btn cancel" onClick={() => setDeleteDialogOpen(false)}>OUI</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Date Picker Modal */}
            {datePickerOpen && (
                <div className="date-picker-overlay" onClick={() => setDatePickerOpen(false)}>
                    <div className="date-picker-modal" onClick={(e) => e.stopPropagation()}>
                        {currentView === 'month' ? (
                            <div className="date-picker-month-view">
                                <div className="date-picker-year-header">
                                    <button className="date-picker-nav-btn" onClick={() => setCurrentYear(currentYear - 1)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                    <span className="date-picker-year-text">{currentYear}</span>
                                    <button className="date-picker-nav-btn" onClick={() => setCurrentYear(currentYear + 1)}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                                <div className="date-picker-month-grid">
                                    {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].map((month, index) => {
                                        const isSelected = currentMonth.getMonth() === index && currentMonth.getFullYear() === currentYear;
                                        const isHighlighted = index === 5; // June highlighted in light blue
                                        return (
                                            <button
                                                key={month}
                                                className={`date-picker-month-btn ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                                                onClick={() => {
                                                    setCurrentMonth(new Date(currentYear, index, 1));
                                                    setCurrentView('calendar');
                                                }}
                                            >
                                                {month}
                                                {isSelected && <span className="date-picker-month-dot"></span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="date-picker-calendar-view">
                                <div className="date-picker-calendar-header">
                                    <button className="date-picker-nav-btn" onClick={() => {
                                        const newDate = new Date(currentMonth);
                                        newDate.setMonth(newDate.getMonth() - 1);
                                        setCurrentMonth(newDate);
                                        setCurrentYear(newDate.getFullYear());
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                    <div className="date-picker-month-year" onClick={() => {
                                        setCurrentYear(currentMonth.getFullYear());
                                        setCurrentView('month');
                                    }}>
                                        <span>{['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <button className="date-picker-nav-btn" onClick={() => {
                                        const newDate = new Date(currentMonth);
                                        newDate.setMonth(newDate.getMonth() + 1);
                                        setCurrentMonth(newDate);
                                        setCurrentYear(newDate.getFullYear());
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                </div>
                                <div className="date-picker-weekdays">
                                    {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => (
                                        <div key={day} className="date-picker-weekday">{day}</div>
                                    ))}
                                </div>
                                <div className="date-picker-days">
                                    {(() => {
                                        const year = currentMonth.getFullYear();
                                        const month = currentMonth.getMonth();
                                        const firstDay = new Date(year, month, 1);
                                        const startDate = new Date(firstDay);
                                        // Monday is day 1, so adjust if first day is Sunday (day 0)
                                        const dayOfWeek = firstDay.getDay();
                                        const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                                        startDate.setDate(startDate.getDate() - offset);
                                        
                                        const days = [];
                                        const currentDate = new Date(startDate);
                                        
                                        for (let i = 0; i < 42; i++) {
                                            const date = new Date(currentDate);
                                            const isCurrentMonth = date.getMonth() === month;
                                            const dateNum = date.getDate();
                                            
                                            // Check if this is April 2023 for the specific highlights
                                            const isApril2023 = year === 2023 && month === 3;
                                            
                                            // Selected date (12) - light blue
                                            const isSelected = dateNum === 12 && isCurrentMonth && isApril2023;
                                            
                                            // Range 1: April 26-29 (dark green)
                                            const isInRange1 = isCurrentMonth && isApril2023 && dateNum >= 26 && dateNum <= 29;
                                            
                                            // Range 2: April 30 to May 3 (dark green)
                                            const isInRange2 = isApril2023 && (
                                                (isCurrentMonth && dateNum === 30) ||
                                                (date.getMonth() === 4 && date.getFullYear() === 2023 && dateNum >= 1 && dateNum <= 3)
                                            );
                                            
                                            days.push(
                                                <button
                                                    key={i}
                                                    className={`date-picker-day ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''} ${isInRange1 || isInRange2 ? 'range' : ''}`}
                                                    onClick={() => {
                                                        if (isCurrentMonth) {
                                                            const day = date.getDate();
                                                            const monthNum = date.getMonth() + 1;
                                                            const yearNum = date.getFullYear();
                                                            setSelectedDate(`${day.toString().padStart(2, '0')}/${monthNum.toString().padStart(2, '0')}/${yearNum}`);
                                                            setDatePickerOpen(false);
                                                        }
                                                    }}
                                                >
                                                    {dateNum}
                                                    {isInRange1 && dateNum === 26 && <span className="date-picker-range-dot"></span>}
                                                </button>
                                            );
                                            currentDate.setDate(currentDate.getDate() + 1);
                                        }
                                        return days;
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CommandesPage() {
    return (
        <Suspense fallback={
            <div className="commandes-page commandes-non-confirme">
                <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>
            </div>
        }>
            <CommandesContent />
        </Suspense>
    );
}
