
import { Icons } from "@/components/Icons";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="flex justify-center space-x-6 md:order-2">
          <a
            href="https://www.facebook.com/profile.php?id=100092387506106"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Facebook</span>
            <Icons.facebook className="h-6 w-6" />
          </a>
          <a
            href="https://twitter.com/OpenT_AI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">X (Twitter)</span>
            <Icons.twitter className="h-6 w-6" />
          </a>
          <a
            href="https://instagram.com/opent.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">Instagram</span>
            <Icons.instagram className="h-6 w-6" />
          </a>
          <a
            href="https://www.linkedin.com/company/opent-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <span className="sr-only">LinkedIn</span>
            <Icons.linkedin className="h-6 w-6" />
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <p className="text-center text-xs leading-5 text-gray-500">
            &copy; 2025 Openteknologies Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
