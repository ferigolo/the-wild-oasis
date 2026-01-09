import Link from "next/link";
import { auth } from "../_lib/auth";
import Image from "next/image";

export default async function Navigation() {
  const session = await auth();
  return (
    <nav className="z-10 text-xl">
      <ul className="flex gap-16 items-center">
        <li>
          <Link
            href="/cabins"
            className="hover:text-accent-400 transition-colors">
            Cabins
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="hover:text-accent-400 transition-colors">
            About
          </Link>
        </li>
        <li>
          <Link
            href="/account"
            className="hover:text-accent-400 transition-colors relative flex items-center gap-4 ">
            <span>Guest area</span>
            {session?.user?.image ? (
              <div className="w-8 h-8 relative">
                <Image
                  fill
                  className="h-8 rounded-full shadow"
                  src={session.user.image}
                  alt={session.user.name || ""}
                  referrerPolicy="no-referrer"></Image>
              </div>
            ) : null}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
