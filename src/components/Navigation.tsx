'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Scale, Bot, Dumbbell, Utensils, TrendingUp, Camera, Settings, LogIn } from 'lucide-react';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/weight', label: 'Weight', icon: Scale },
    { href: '/chat', label: 'AI Coach', icon: Bot },
    { href: '/workout', label: 'Workout', icon: Dumbbell },
    { href: '/nutrition', label: 'Nutrition', icon: Utensils },
    { href: '/track', label: 'Track', icon: TrendingUp },
    { href: '/scan', label: 'Scan', icon: Camera },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/auth', label: 'Login', icon: LogIn },
];

export default function Navigation() {
    const pathname = usePathname();

    // Hide navigation on onboarding page
    if (pathname === '/onboarding') {
        return null;
    }

    return (
        <nav className="nav-bottom">
            <ul className="nav-bottom-list">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <li key={item.href} className="nav-bottom-item">
                            <Link
                                href={item.href}
                                className={`nav-bottom-link ${pathname === item.href ? 'active' : ''}`}
                            >
                                <Icon className="nav-bottom-icon" />
                                <span className="nav-bottom-label">{item.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
