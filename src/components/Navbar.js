"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        {name: "Budget", href: "/budget"},
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 bg-[#f3f3f3] shadow-md z-50 w-full text-black-900 dark:bg-[#1e293b] dark:text-white-500 transition-colors duration-300 ease-in-out">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-12 mx-auto">
                    {/* Logo */}
                    <div className="flex-shrink-0 left-0" >
                        <Link href="/" className="text-xl font-bold text-white-500 hover:text-indigo-200">
                            Expense Tracker
                        </Link>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden md:flex space-x-4 text-white-500">
                        {navItems.map((item) => (
                            <Button
                                key={item.href}
                                variant="ghost"
                                asChild
                                className={`${pathname === item.href
                                        ? "text-indigo-200 font-semibold"
                                        : "text-white-600"
                                    } hover:text-indigo-200`}
                            >
                                <Link href={item.href}>{item.name} </Link>
                            </Button>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                                <nav className="flex flex-col space-y-4 mt-4">
                                    {navItems.map((item) => (
                                        <Button
                                            key={item.href}
                                            variant="ghost"
                                            asChild
                                            className={`${pathname === item.href
                                                    ? "text-indigo-200 font-semibold"
                                                    : "text-white-600"
                                                } hover:text-indigo-200 justify-start`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <Link href={item.href}>{item.name}</Link>
                                        </Button>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </nav>
    );
}