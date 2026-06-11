'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function UnlockWebviewContent() {
  const searchParams = useSearchParams();
  const configId = searchParams.get('configId');
  const psid = searchParams.get('psid');
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageConfig, setPageConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load the Messenger Extensions SDK
    const script = document.createElement('script');
    script.src = "//connect.facebook.net/en_US/messenger.Extensions.js";
    script.async = true;
    document.body.appendChild(script);

    // Load page configuration
    if (configId) {
      fetchPageConfig();
    }
  }, [configId]);

  const fetchPageConfig = async () => {
    try {
      const response = await fetch(`/api/page-configurations?id=${configId}`);
      if (response.ok) {
        const data = await response.json();
        setPageConfig(data);
      } else {
        setError('Failed to load page configuration');
      }
    } catch (err) {
      setError('Error loading page configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    setClaiming(true);
    setError(null);
    try {
      // Send claim request to your backend
      const res = await fetch('/api/webview/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId, psid })
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error && !pageConfig) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans text-center">
        <div className="text-red-600 mb-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 font-sans overflow-hidden">
      {/* Top instruction banner */}
      <div className="sticky top-0 z-20 bg-[#1877F2] text-white px-4 py-3 text-center shadow-md">
        <p className="text-sm font-semibold">
          Step 1: Tap the <span className="underline">Follow</span> button below
        </p>
      </div>

      {/* Facebook Page Plugin Iframe (the "real" page) */}
      <div className="flex justify-center px-2 pt-4 pb-[220px]">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ width: '340px' }}>
          <iframe
            src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(pageConfig?.page_url || 'https://www.facebook.com/facebook')}&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=4552936261602709`}
            width="340"
            height="500"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          ></iframe>
        </div>
      </div>

      {/* Bottom overlay container (the ManyChat-style "reveal" trap) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] rounded-t-2xl px-5 pt-5 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">2</span>
            <h2 className="text-base font-bold text-gray-900">Reveal Your Gift</h2>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Once you&apos;ve tapped <span className="font-semibold text-gray-700">Follow</span> on the page above, tap the button below to unlock your reward.
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
            By tapping above, you confirm you have followed our page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnlockWebview() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    }>
      <UnlockWebviewContent />
    </Suspense>
  );
}
