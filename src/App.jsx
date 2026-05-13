import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useComicGenerator } from './hooks/useComicGenerator';
import { comicsApi } from './services/backend';
import AccountPanel from './components/AccountPanel';
import StoryInput from './components/StoryInput';
import ComicGrid from './components/ComicGrid';
import LoadingScreen from './components/LoadingScreen';
import DownloadButton from './components/DownloadButton';

export default function App() {
  const auth = useAuth();
  const { panels, loading, currentPanel, totalPanels, error, done, generate, reset } = useComicGenerator();
  const comicRef = useRef(null);

  const [myComics, setMyComics] = useState([]);
  const [profileComics, setProfileComics] = useState([]);
  const [myComicsLoading, setMyComicsLoading] = useState(false);
  const [profileComicsLoading, setProfileComicsLoading] = useState(false);
  const [libraryError, setLibraryError] = useState(null);
  const [postStatus, setPostStatus] = useState(null);

  const hasContent = panels.length > 0;

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

    if (!generatedComic.imageUrl) {
      setPostStatus({
        type: 'error',
        message: 'Comic generated, but no image was available to post.',
      });
      return;
    }

    try {
      const savedComic = await comicsApi.create({
        imageUrl: generatedComic.imageUrl,
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

  const storyDisabled = auth.loading;
  const storyDisabledMessage = 'CHECKING PROFILE...';

  return (
    <div className="app">
      <header className="site-header">
        <div className="header-inner">
          <div className="logo-area">
            <span className="logo-icon">COMIC</span>
            <div>
              <h1 className="site-title">COMIC-AI</h1>
              <p className="site-tagline">Turn any story into a comic book</p>
            </div>
          </div>
          <div className="header-badges">
            <span className="header-badge">STORY</span>
            <span className="header-badge red">PANELS</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <AccountPanel
          auth={auth}
          myComics={myComics}
          myComicsLoading={myComicsLoading}
          profileComics={profileComics}
          profileComicsLoading={profileComicsLoading}
          onLoadProfileComics={loadProfileComics}
        />

        {libraryError && (
          <div className="status-banner error" role="alert">
            <strong>Profile request failed:</strong> {libraryError}
          </div>
        )}

        {!auth.isAuthenticated && !auth.loading && (
          <div className="status-banner info" role="status">
            You can generate comics as a guest. Create an account to save them to your profile and share them with other users.
          </div>
        )}

        {!done && (
          <StoryInput
            onGenerate={handleGenerate}
            loading={loading}
            disabled={storyDisabled}
            disabledMessage={storyDisabledMessage}
          />
        )}

        {loading && (
          <LoadingScreen currentPanel={currentPanel} totalPanels={totalPanels} />
        )}

        {error && (
          <div className="error-banner" role="alert">
            <strong>Something went wrong:</strong> {error}
            <button className="error-retry" onClick={reset}>Try Again</button>
          </div>
        )}

        {postStatus && (
          <div className={`status-banner ${postStatus.type}`} role="status">
            {postStatus.message}
          </div>
        )}

        {hasContent && (
          <>
            <div className="comic-section-header">
              <span className="badge green">PREVIEW</span>
              <h2 className="section-title">Your Comic</h2>
            </div>

            <ComicGrid
              ref={comicRef}
              panels={panels}
              totalPanels={totalPanels}
            />

            {done && (
              <DownloadButton comicRef={comicRef} onReset={reset} />
            )}
          </>
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

        .header-badges {
          display: flex;
          gap: 0.5rem;
        }

        .header-badge {
          font-family: var(--font-display);
          font-size: 0.85rem;
          letter-spacing: 1px;
          padding: 4px 10px;
          background: var(--blue);
          color: white;
          border: 2px solid var(--yellow);
          border-radius: 2px;
        }

        .header-badge.red {
          background: var(--red);
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
