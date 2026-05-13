import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useComicGenerator } from './hooks/useComicGenerator';
import { comicsApi, uploadsApi } from './services/backend';
import CreateComicPage from './pages/CreateComicPage';
import ProfilePage from './pages/ProfilePage';

function getRouteFromHash() {
  return window.location.hash === '#/profile' ? 'profile' : 'create';
}

export default function App() {
  const auth = useAuth();
  const { panels, loading, currentPanel, totalPanels, error, done, generate, reset } = useComicGenerator();
  const comicRef = useRef(null);
  const [route, setRoute] = useState(getRouteFromHash);

  const [myComics, setMyComics] = useState([]);
  const [profileComics, setProfileComics] = useState([]);
  const [myComicsLoading, setMyComicsLoading] = useState(false);
  const [profileComicsLoading, setProfileComicsLoading] = useState(false);
  const [libraryError, setLibraryError] = useState(null);
  const [postStatus, setPostStatus] = useState(null);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRouteFromHash());

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const refreshMyComics = useCallback(async () => {
    if (!auth.token) {
      setMyComics([]);
      return;
    }

    setMyComicsLoading(true);
    try {
      const comics = await comicsApi.getMine(auth.token);
      setMyComics(comics);
      setLibraryError(null);
    } catch (err) {
      setLibraryError(err.message);
    } finally {
      setMyComicsLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    refreshMyComics();

    if (!auth.token) {
      setProfileComics([]);
      setPostStatus(null);
    }
  }, [auth.token, refreshMyComics]);

  const loadProfileComics = useCallback(async (ownerUuid) => {
    if (!auth.token) {
      return;
    }

    setProfileComicsLoading(true);
    try {
      const comics = await comicsApi.getByOwnerUuid(ownerUuid, auth.token);
      setProfileComics(comics);
      setLibraryError(null);
    } catch (err) {
      setLibraryError(err.message);
    } finally {
      setProfileComicsLoading(false);
    }
  }, [auth.token]);

  const handleGenerate = useCallback(async (story, panelCount, style, metadata) => {
    setPostStatus(null);
    const generatedComic = await generate(story, panelCount, style, metadata);

    if (!generatedComic) {
      return;
    }

    if (!auth.token) {
      setPostStatus({
        type: 'info',
        message: 'Comic generated in guest mode. Create an account to save and share comics with other users.',
      });
      return;
    }

    if (!generatedComic.imageDataUrls?.length) {
      setPostStatus({
        type: 'error',
        message: 'Comic generated, but no images were available to upload.',
      });
      return;
    }

    try {
      const uploadResult = await uploadsApi.uploadComicImages(
        generatedComic.imageDataUrls,
        auth.token
      );

      const savedComic = await comicsApi.create({
        imageUrls: uploadResult.urls,
        captions: generatedComic.captions,
        dialogues: generatedComic.dialogues,
        name: generatedComic.name,
        description: generatedComic.description,
      }, auth.token);

      setMyComics(prev => [
        savedComic,
        ...prev.filter(comic => comic.uuid !== savedComic.uuid),
      ]);
      setPostStatus({
        type: 'success',
        message: 'Comic posted to your profile.',
      });
    } catch (err) {
      setPostStatus({
        type: 'error',
        message: `Comic generated, but posting failed: ${err.message}`,
      });
    }
  }, [auth.token, generate]);

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <a className="logo-area" href="#/" aria-label="Comic AI home">
            <span className="logo-icon">COMIC</span>
            <div>
              <h1 className="site-title">COMIC-AI</h1>
              <p className="site-tagline">Turn any story into a comic book</p>
            </div>
          </a>
          <nav className="header-nav" aria-label="Primary navigation">
            <a className={`header-nav-link ${route === 'create' ? 'active' : ''}`} href="#/">
              Create
            </a>
            <a className={`header-nav-link ${route === 'profile' ? 'active' : ''}`} href="#/profile">
              {auth.isAuthenticated ? 'Profile' : 'Sign In'}
            </a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {route === 'profile' ? (
          <ProfilePage
            auth={auth}
            libraryError={libraryError}
            myComics={myComics}
            myComicsLoading={myComicsLoading}
            profileComics={profileComics}
            profileComicsLoading={profileComicsLoading}
            onLoadProfileComics={loadProfileComics}
          />
        ) : (
          <CreateComicPage
            auth={auth}
            comicRef={comicRef}
            currentPanel={currentPanel}
            done={done}
            error={error}
            loading={loading}
            onGenerate={handleGenerate}
            panels={panels}
            postStatus={postStatus}
            reset={reset}
            totalPanels={totalPanels}
          />
        )}
      </main>

      <footer className="site-footer">
        <p>Built with React + AI generation</p>
      </footer>

      <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .site-header {
          background: var(--ink);
          border-bottom: 4px solid var(--yellow);
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: inherit;
          text-decoration: none;
        }

        .logo-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 58px;
          height: 38px;
          background: var(--yellow);
          border: 3px solid var(--red);
          border-radius: 2px;
          color: var(--ink);
          font-family: var(--font-display);
          font-size: 1rem;
          letter-spacing: 1px;
          transform: rotate(-3deg);
        }

        .site-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          letter-spacing: 5px;
          color: var(--yellow);
          text-shadow: 3px 3px 0 var(--red);
          line-height: 1;
        }

        .site-tagline {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: #aaa;
          letter-spacing: 1px;
        }

        .header-nav {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .header-nav-link {
          font-family: var(--font-display);
          font-size: 1rem;
          letter-spacing: 1px;
          padding: 7px 12px;
          background: white;
          color: var(--ink);
          border: 2px solid var(--yellow);
          border-radius: 2px;
          text-decoration: none;
          box-shadow: 3px 3px 0 var(--red);
          transition: all 0.15s;
        }

        .header-nav-link:hover,
        .header-nav-link.active {
          background: var(--yellow);
          transform: translate(-1px, -1px);
        }

        .main-content {
          flex: 1;
          padding: 2.5rem 1.5rem;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        .comic-section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .badge {
          background: var(--red);
          color: white;
          font-family: var(--font-display);
          font-size: 0.9rem;
          letter-spacing: 2px;
          padding: 4px 10px;
          border: 2px solid var(--ink);
          border-radius: 2px;
        }

        .badge.green {
          background: #2a8a3e;
        }

        .section-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          letter-spacing: 1px;
        }

        .status-banner,
        .error-banner {
          border: 3px solid var(--ink);
          border-radius: var(--radius);
          padding: 1rem 1.5rem;
          font-family: var(--font-body);
          margin: 0 auto 2rem;
          max-width: 780px;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          box-shadow: var(--shadow);
        }

        .status-banner.info {
          background: #eef5ff;
          border-color: var(--blue);
          color: var(--blue);
          font-weight: 700;
        }

        .status-banner.success {
          background: #effaf1;
          border-color: #2a8a3e;
          color: #1c6b2d;
          font-weight: 700;
        }

        .status-banner.error,
        .error-banner {
          background: #fff0f0;
          border-color: var(--red);
          color: var(--red);
        }

        .error-retry {
          margin-left: auto;
          padding: 6px 14px;
          background: var(--red);
          color: white;
          font-family: var(--font-display);
          font-size: 1rem;
          border: 2px solid var(--ink);
          border-radius: var(--radius);
          cursor: pointer;
        }

        .site-footer {
          background: var(--ink);
          color: #888;
          text-align: center;
          padding: 1rem;
          font-family: var(--font-body);
          font-size: 0.8rem;
          border-top: 3px solid var(--yellow);
        }
      `}</style>
    </div>
  );
}
