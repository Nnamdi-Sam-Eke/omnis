import React, { useEffect, useRef } from 'react';

const formatSeconds = (s) => {
	const mm = Math.floor(s / 60).toString().padStart(1, '0');
	const ss = Math.floor(s % 60).toString().padStart(2, '0');
	return `${mm}:${ss}`;
};

export default function WarningModal({ isOpen, secondsLeft = 120, onStay = () => {}, onLogout = () => {} }) {
	const stayRef = useRef(null);

	useEffect(() => {
		if (!isOpen) return;
		// block background scroll while modal is open
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		// focus primary action for keyboard and mobile
		setTimeout(() => stayRef.current?.focus(), 50);
		return () => { document.body.style.overflow = prev; };
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<div className="fixed  w-70% h-70% inset-0 z-50 backdrop-blur-sm flex items-center justify-center px-4">
			<div className="absolute inset-0 bg-black/55" aria-hidden="true"></div>

			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="idle-modal-title"
				aria-describedby="idle-modal-desc"
				className="relative z-10 w-full max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8"
			>
				<h2 id="idle-modal-title" className="text-lg sm:text-2xl font-semibold text-gray-900 dark:text-white">Are you still there?</h2>
				<p id="idle-modal-desc" className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300">You’ve been inactive for a while. To keep your session secure, we’ll log you out soon.</p>

				<div className="mt-4 flex items-center justify-between">
					<div className="text-sm sm:text-base text-gray-700 dark:text-gray-200">Logging out in</div>
					<div className="text-lg sm:text-2xl font-mono font-semibold text-gray-900 dark:text-white">{formatSeconds(secondsLeft)}</div>
				</div>

				<div className="mt-6 flex flex-col sm:flex-row gap-3">
					<button
						ref={stayRef}
						onClick={onStay}
						className="w-full inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-md text-base sm:text-sm font-medium touch-manipulation"
					>
						✅ Stay logged in
					</button>

					<button
						onClick={onLogout}
						className="w-full inline-flex items-center justify-center border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-md text-base sm:text-sm bg-white dark:bg-gray-700"
					>
						🔒 Log out now
					</button>
				</div>
			</div>
		</div>
	);
}
