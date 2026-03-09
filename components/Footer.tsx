import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t border-black/[0.06] py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <p className="text-[13px] text-[#6E6E73]">&copy; {new Date().getFullYear()} SweetShop. All rights reserved.</p>
                <a href="/admin/login" className="text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors">
                    Admin
                </a>
            </div>
        </footer>
    );
}
