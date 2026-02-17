import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-secondary/30 border-t py-8 mt-auto">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} SweetShop. All rights reserved.</p>
                <div className="mt-4 flex justify-center gap-4">
                    <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
                    <Link href="/terms" className="hover:underline">Terms of Service</Link>
                    <Link href="/admin/login" className="hover:underline opacity-50 hover:opacity-100 transition-opacity">Staff Login</Link>
                </div>
            </div>
        </footer>
    );
}
