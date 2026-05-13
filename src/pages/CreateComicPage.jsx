import React from 'react';
import StoryInput from '../components/StoryInput';
import ComicGrid from '../components/ComicGrid';
import LoadingScreen from '../components/LoadingScreen';
import DownloadButton from '../components/DownloadButton';

export default function CreateComicPage({
  auth,
  comicRef,
  currentPanel,
  done,
  error,
  loading,
  onGenerate,
  panels,
  postStatus,
  reset,
  totalPanels,
}) {
  const hasContent = panels.length > 0;
  const storyDisabled = auth.loading;
  const storyDisabledMessage = 'CHECKING PROFILE...';

  return (
    <>
      {!auth.isAuthenticated && !auth.loading && (
        <div className="status-banner info" role="status">
          You can generate comics as a guest. Create an account to save them to your profile and share them with other users.
        </div>
      )}

      {!done && (
        <StoryInput
          onGenerate={onGenerate}
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
    </>
  );
}
