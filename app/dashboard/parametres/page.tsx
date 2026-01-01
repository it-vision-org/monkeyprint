import { redirect } from 'next/navigation';

export default function ParametresPage() {
    // For now, redirect to compte (account) page as settings are managed there
    // This can be expanded later to include additional vendor settings
    redirect('/dashboard/compte');
}


