"use client";

import { useState } from "react";
import Link from "next/link";
import faqData from "@/lib/faq-data";

type Lang = "zh" | "en";

export default function FAQPage() {
    const [lang, setLang] = useState<Lang>("zh");
    const [openIndex, setOpenIndex] = useState<string | null>(null);

    const toggleItem = (categoryIndex: number, itemIndex: number) => {
        const key = `${categoryIndex}-${itemIndex}`;
        setOpenIndex(openIndex === key ? null : key);
    };

    const labels = {
        zh: {
            title: "常見問題 FAQ",
            langSwitch: "English",
            backHome: "返回首頁",
        },
        en: {
            title: "Frequently Asked Questions",
            langSwitch: "中文",
            backHome: "Back to Home",
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
                        Sweet's
                    </Link>
                    <button
                        onClick={() => setLang(lang === "zh" ? "en" : "zh")}
                        className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-black border border-gray-300 rounded-full hover:border-gray-400 transition"
                    >
                        {labels[lang].langSwitch}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    {labels[lang].title}
                </h1>

                <div className="space-y-8">
                    {faqData.map((category, catIndex) => (
                        <section key={catIndex}>
                            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                                {category.title[lang]}
                            </h2>
                            <div className="space-y-2">
                                {category.items.map((item, itemIndex) => {
                                    const key = `${catIndex}-${itemIndex}`;
                                    const isOpen = openIndex === key;
                                    return (
                                        <div key={itemIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <button
                                                onClick={() => toggleItem(catIndex, itemIndex)}
                                                className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-gray-50 transition"
                                            >
                                                <span className="font-medium text-gray-900">{item.question[lang]}</span>
                                                <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                                    ▼
                                                </span>
                                            </button>
                                            {isOpen && (
                                                <div className="px-4 py-3 bg-gray-50 text-gray-700 whitespace-pre-wrap text-sm border-t border-gray-200">
                                                    {item.answer[lang]}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
                        ← {labels[lang].backHome}
                    </Link>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t py-8 mt-12">
                <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} Sweet's Meringue Shop — 香甜手作
                </div>
            </footer>
        </div>
    );
}
