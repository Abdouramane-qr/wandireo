import { usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from '@/hooks/useWdrRouter';
import { Footer } from './Footer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import '@/styles/wdr-theme.css';

interface WdrPageShellProps {
    children: React.ReactNode;
}

export function WdrPageShell({ children }: WdrPageShellProps) {
    const { currentUser, logout } = useUser();
    const { navigate } = useRouter();
    const page = usePage();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const currentPath = page.url;

    return (
        <div className="wdr-theme">
            <Header
                user={currentUser}
                currentPath={currentPath}
                onLogoClick={() => navigate({ name: 'home' })}
                onLoginClick={() => navigate({ name: 'login' })}
                onRegisterClick={() => navigate({ name: 'register' })}
                onPartnerClick={() =>
                    navigate({
                        name:
                            currentUser?.role === 'PARTNER'
                                ? 'partner-dashboard'
                                : 'partner-register',
                    })
                }
                onAdminClick={() => navigate({ name: 'admin-dashboard' })}
                onLogoutClick={logout}
                onMenuOpen={() => setIsSidebarOpen(true)}
            />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={currentUser}
                currentPath={currentPath}
                onLoginClick={() => navigate({ name: 'login' })}
                onRegisterClick={() => navigate({ name: 'register' })}
            />
            <main className="wdr-theme__content">{children}</main>
            <Footer />
        </div>
    );
}

export default WdrPageShell;
