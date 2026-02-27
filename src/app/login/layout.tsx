import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | NavAI',
    description: 'Sign in to your NavAI account to access professional maritime tools, simulators, and navigation resources.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
    return children;
}
