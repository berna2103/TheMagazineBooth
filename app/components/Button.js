import Link from 'next/link';

export function Button({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-block bg-white text-black font-bold py-3 px-8 text-lg hover:bg-gray-200 transition-colors duration-300"
    >
      {children}
    </Link>
  );
}