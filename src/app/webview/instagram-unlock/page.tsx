'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function InstagramUnlockWebviewContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get('offerId');
  const psid = searchParams.get('psid');
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [giftOffer, setGiftOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the Messenger Extensions SDK
    const script = document.createElement('script');
    script.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
    script.async = true;
    document.body.appendChild(script);

    // Load gift offer configuration
    if (offerId) {
      fetchGiftOffer();
    }
  }, [offerId]);

  const fetchGiftOffer = async () => {
    try {
      const response = await fetch(`/api/instagram-gift-offers?id=${offerId}`);
      const data = await response.json();
      
      if (response.ok && data) {
        setGiftOffer(data);
      } else {
        setError('Gift offer not found or has been removed.');
      }
    } catch (err) {
      console.error('Error loading gift offer:', err);
      setError('Error loading gift offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);
    try {
      // Send claim request to your backend
      const res = await fetch('/api/webview/instagram-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, psid })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'already_claimed') {
          setError('You have already claimed this gift.');
          setClaiming(false);
          return;
        }
        
        // Tell Messenger to close the Webview
        // @ts-ignore
        if (window.MessengerExtensions) {
          // @ts-ignore
          window.MessengerExtensions.requestCloseBrowser(
            function success() { /* Webview closes */ },
            function error(err: any) { 
              console.error('Error closing webview:', err);
              // Fallback: redirect to close
              window.close();
            }
          );
        } else {
          // Fallback if SDK not loaded
          window.close();
        }
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to claim gift');
        setClaiming(false);
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred. Please try again.');
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error && !giftOffer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans text-center">
        <div className="text-red-600 mb-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Top instruction banner */}
      <div className="sticky top-0 z-20 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white px-4 py-3 text-center shadow-md">
        <p className="text-sm font-semibold">
          Step 1: Follow @{giftOffer?.account_username || 'our Instagram account'}
        </p>
      </div>

      {/* Instagram Profile Card */}
      <div className="flex justify-center px-2 pt-4 pb-[220px]">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ width: '340px' }}>
          <div className="p-6 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">@{giftOffer?.account_username || 'instagram'}</h2>
            <p className="text-sm text-gray-500 mb-4">Follow us to unlock your exclusive gift!</p>
            <a
              href={`https://instagram.com/${giftOffer?.account_username || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition"
            >
              Visit Instagram Profile
            </a>
          </div>
        </div>
      </div>

      {/* Bottom overlay container */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] rounded-t-2xl px-5 pt-5 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">2</span>
            <h2 className="text-base font-bold text-gray-900">Reveal Your Gift</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Once you&apos;ve followed @{giftOffer?.account_username || 'our Instagram account'}, tap the button below to unlock your reward.
          </p>

          <button
            onClick={handleClaim}
            disabled={claiming}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {claiming ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                Unlocking...
              </>
            ) : (
              <>🎁 Reveal My Gift</>
            )}
          </button>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {error}
            </div>
          )}

          <p className="mt-3 text-[11px] text-gray-400 text-center">
            By tapping above, you confirm you have followed our Instagram account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function InstagramUnlockWebview() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    }>
      <InstagramUnlockWebviewContent />
    </Suspense>
  );
}
