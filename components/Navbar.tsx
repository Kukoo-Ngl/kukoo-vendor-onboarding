import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-[#1A3A6B] text-white px-6 py-4 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo.png" alt="Kukoo" width={32} height={32} />
        <span className="text-xl font-bold">Kukoo</span>
      </Link>
      <div className="flex gap-6">
        <Link href="/" className="hover:text-[#F5A623]">Onboarding</Link>
        <Link href="/admin" className="hover:text-[#F5A623]">Admin</Link>
      </div>
    </nav>
  );
}
