import React from 'react';
import moretfWhiteLogo from '../../assets/moretf-white-medium.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shadow bg-warmscale-8">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a href="/" className="flex items-center mb-4 sm:mb-0 space-x-3">
            <img src="/new-logo-big.png" className="h-8" alt="more.tf Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              more.tf
            </span>
          </a>
          <ul className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
            <li>
              <a
                href="https://github.com/calisirmori/more.tf"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                title="Source Code"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://discord.gg/HAmNGBScPz"
                className="hover:underline"
                target="_blank"
                rel="noopener noreferrer"
                title="Discord Server"
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © {currentYear}{' '}
          <a href="https://discord.gg/dRVbHUy8ZT" className="hover:underline">
            more.tf
          </a>{' '}
          by Mori and Treemonkey. All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
