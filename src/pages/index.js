import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [fonts, setFonts] = useState([]);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.particlesJS) {
        console.log("Initializing particles.js...");
        window.particlesJS('particles-js', {
          particles: {
            number: {
              value: 100,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: '#00FFFF'
            },
            shape: {
              type: 'circle',
              stroke: {
                width: 0,
                color: '#000000'
              }
            },
            opacity: {
              value: 0.5,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
              }
            },
            size: {
              value: 5,
              random: true,
              anim: {
                enable: true,
                speed: 40,
                size_min: 0.1,
                sync: false
              }
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: '#00FFFF',
              opacity: 0.4,
              width: 1
            },
            move: {
              enable: true,
              speed: 6,
              direction: 'none',
              random: true,
              straight: false,
              out_mode: 'out',
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
              }
            }
          },
          interactivity: {
            detect_on: 'canvas',
            events: {
              onhover: {
                enable: true,
                mode: 'repulse'
              },
              onclick: {
                enable: true,
                mode: 'push'
              },
              resize: true
            }
          },
          retina_detect: true
        });
      } else {
        console.error('particles.js failed to load.');
      }
    }
  }, []);

  const handleFontFetch = async () => {
    setError('');
    setFonts([]);
    setNotification('');

    if (!url) {
      setError('Please enter a valid URL.');
      return;
    }

    try {
      const res = await fetch(`/api/fonts?url=${url}`);
      const data = await res.json();

      if (data.fonts && data.fonts.length > 0) {
        setFonts(data.fonts);
      } else {
        setError('No fonts found for this URL.');
      }
    } catch (err) {
      setError('Failed to fetch fonts. Please try again.');
    }
  };

  const handleCopyFont = (font) => {
    navigator.clipboard.writeText(font).then(() => {
      setNotification(`Font "${font}" copied to clipboard!`);
      setTimeout(() => setNotification(''), 3000);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFontFetch();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Particles container */}
      <div id="particles-js" className="absolute top-0 left-0 w-full h-full z-0 bg-transparent"></div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-neonBlue text-white py-2 px-4 rounded-lg shadow-lg">
          {notification}
        </div>
      )}

      <div className="z-10 w-full max-w-lg space-y-8 animate-fadeIn">
        {/* Title */}
        <h2 className="text-center text-5xl font-bold text-neonBlue hover:text-neonPurple transition duration-300">
          FontID
        </h2>

        {/* Search Box Section */}
        <div className="rounded-lg shadow-lg bg-transparent p-8 space-y-6 border-2 border-neonBlue w-full max-w-3xl mx-auto">
          <div className="space-y-4">
            <input
              type="text"
              className="w-full p-3 bg-darkBlue text-white border border-neonBlue rounded-lg focus:outline-none focus:ring-2 focus:ring-neonBlue focus:ring-opacity-50"
              placeholder="Enter URL (e.g., https://google.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleFontFetch}
              className="w-full py-3 bg-[#00f2f2] text-[#2d2d2d] rounded-lg transition duration-200 ease-in-out hover:bg-[#00e1ff] hover:text-black"
            >
              Fetch Fonts
            </button>
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </div>
      </div>

      {/* Fonts Display Section */}
      {fonts.length > 0 && (
        <div className="z-10 w-full max-w-screen-xl px-4 py-8">
          <h3 className="text-2xl font-semibold text-neonBlue mb-6">Fonts Found:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fonts.map((font, index) => (
              <div
                key={index}
                className="p-6 bg-darkBlue text-white rounded-lg shadow-md border-2 border-neonBlue flex flex-col justify-between transform hover:scale-105 transition duration-300 ease-in-out"
                style={{ fontFamily: font }}
              >
                <p className="text-xl font-semibold mb-2">{font}</p>
                <p className="text-sm text-gray-400 italic mb-4">
                  The quick brown fox jumps over the lazy dog
                </p>
                <button
                  onClick={() => handleCopyFont(font)}
                  className="py-2 bg-[#00f2f2] text-[#2d2d2d] rounded-lg transition duration-200 ease-in-out hover:bg-[#00e1ff] hover:text-black"
                >
                  Copy Font
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="z-10 w-full py-2 bg-[rgba(0,255,255,0.2)] text-center text-neonBlue mt-auto">
        <p className="made-with-love">Made with <span style={{ color: '#00FFFF' }}>❤️</span></p>
      </footer>
    </div>
  );
}
