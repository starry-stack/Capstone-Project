import React, { useState } from 'react';
import { resolveBackendFileUrl } from '../services/backend';

function getComicImages(comic) {
  if (Array.isArray(comic.url)) {
    return comic.url.map(resolveBackendFileUrl);
  }

  return comic.url ? [resolveBackendFileUrl(comic.url)] : [];
}

function getComicCaptions(comic) {
  if (Array.isArray(comic.caption)) {
    return comic.caption;
  }

  return comic.caption ? [comic.caption] : [];
}

function ComicList({ title, comics, emptyText, onSelectComic }) {
  return (
    <div className="comic-list-block">
      <h3 className="account-subtitle">{title}</h3>
      {comics.length > 0 ? (
        <div className="profile-comics">
          {comics.map(comic => {
            const images = getComicImages(comic);
            const coverImage = images[0];

            return (
              <button
                className="profile-comic-card"
                key={comic.uuid || comic._id}
                type="button"
                onClick={() => onSelectComic(comic)}
              >
                {coverImage && (
                  <img className="profile-comic-image" src={coverImage} alt={comic.name} />
                )}
                <div className="profile-comic-copy">
                  <h4>{comic.name}</h4>
                  <p>{comic.description}</p>
                  <span className="profile-panel-count">
                    {images.length} {images.length === 1 ? 'panel' : 'panels'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="account-muted">{emptyText}</p>
      )}
    </div>
  );
}

function ComicPreviewDialog({ comic, onClose }) {
  if (!comic) {
    return null;
  }

  const images = getComicImages(comic);
  const captions = getComicCaptions(comic);

  return (
    <div className="preview-backdrop" role="presentation" onClick={onClose}>
      <section
        className="comic-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comic-preview-title"
        onClick={event => event.stopPropagation()}
      >
        <div className="preview-header">
          <div>
            <span className="badge">PREVIEW</span>
            <h3 className="preview-title" id="comic-preview-title">{comic.name}</h3>
          </div>
          <button className="preview-close-btn" type="button" onClick={onClose} aria-label="Close preview">
            CLOSE
          </button>
        </div>

        <p className="preview-description">{comic.description}</p>

        <div className="preview-panels">
          {images.map((imageUrl, index) => (
            <figure className="preview-panel" key={`${comic.uuid || comic._id}-panel-${index}`}>
              <div className="preview-panel-number">{index + 1}</div>
              <img src={imageUrl} alt={`${comic.name} panel ${index + 1}`} />
              {captions[index] && (
                <figcaption>{captions[index]}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AccountPanel({
  auth,
  myComics,
  myComicsLoading,
  profileComics,
  profileComicsLoading,
  onLoadProfileComics,
}) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [ownerUuid, setOwnerUuid] = useState('');
  const [formError, setFormError] = useState(null);
  const [selectedComic, setSelectedComic] = useState(null);

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setFormError(null);

    try {
      if (mode === 'register') {
        await auth.register(form);
      } else {
        await auth.login({
          email: form.email,
          password: form.password,
        });
      }

      setForm(prev => ({ ...prev, password: '' }));
    } catch (err) {
      setFormError(err.message);
    }
  };

  const submitProfileLookup = (event) => {
    event.preventDefault();
    const trimmedUuid = ownerUuid.trim();

    if (trimmedUuid) {
      onLoadProfileComics(trimmedUuid);
    }
  };

  if (!auth.isAuthenticated) {
    return (
      <section className="account-panel">
        <div className="account-header">
          <span className="badge">ACCOUNT</span>
          <h2 className="account-title">{mode === 'login' ? 'Sign In' : 'Create Profile'}</h2>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            type="button"
            onClick={() => setMode('login')}
          >
            LOGIN
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            type="button"
            onClick={() => setMode('register')}
          >
            REGISTER
          </button>
        </div>

        <form className="auth-form" onSubmit={submitAuth}>
          {mode === 'register' && (
            <label className="form-field">
              <span>NAME</span>
              <input
                value={form.name}
                onChange={event => updateForm('name', event.target.value)}
                disabled={auth.loading}
                required
              />
            </label>
          )}

          <label className="form-field">
            <span>EMAIL</span>
            <input
              type="email"
              value={form.email}
              onChange={event => updateForm('email', event.target.value)}
              disabled={auth.loading}
              required
            />
          </label>

          <label className="form-field">
            <span>PASSWORD</span>
            <input
              type="password"
              value={form.password}
              onChange={event => updateForm('password', event.target.value)}
              disabled={auth.loading}
              minLength={6}
              required
            />
          </label>

          {(formError || auth.error) && (
            <p className="account-error" role="alert">{formError || auth.error}</p>
          )}

          <button className="account-primary-btn" type="submit" disabled={auth.loading}>
            {auth.loading ? 'WORKING...' : mode === 'login' ? 'SIGN IN' : 'CREATE PROFILE'}
          </button>
        </form>

        <style>{accountPanelStyles}</style>
      </section>
    );
  }

  return (
    <section className="account-panel">
      <div className="account-header">
        <span className="badge">PROFILE</span>
        <h2 className="account-title">{auth.user.name}</h2>
        <button className="logout-btn" type="button" onClick={auth.logout}>
          LOG OUT
        </button>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3 className="account-subtitle">Your Profile</h3>
          <dl className="profile-fields">
            <div>
              <dt>Email</dt>
              <dd>{auth.user.email}</dd>
            </div>
            <div>
              <dt>UUID</dt>
              <dd>{auth.user.uuid}</dd>
            </div>
          </dl>
        </div>

        <form className="profile-card lookup-card" onSubmit={submitProfileLookup}>
          <h3 className="account-subtitle">Find Public Comics</h3>
          <label className="form-field">
            <span>USER UUID</span>
            <input
              value={ownerUuid}
              onChange={event => setOwnerUuid(event.target.value)}
              disabled={profileComicsLoading}
            />
          </label>
          <button
            className="account-primary-btn"
            type="submit"
            disabled={profileComicsLoading || !ownerUuid.trim()}
          >
            {profileComicsLoading ? 'LOADING...' : 'LOAD COMICS'}
          </button>
        </form>
      </div>

      <div className="profile-library-grid">
        <ComicList
          title="Your Comics"
          comics={myComics}
          emptyText={myComicsLoading ? 'Loading comics...' : 'No comics posted yet.'}
          onSelectComic={setSelectedComic}
        />
        <ComicList
          title="Profile Comics"
          comics={profileComics}
          emptyText={profileComicsLoading ? 'Loading comics...' : 'Enter a UUID to view public comics.'}
          onSelectComic={setSelectedComic}
        />
      </div>

      <ComicPreviewDialog
        comic={selectedComic}
        onClose={() => setSelectedComic(null)}
      />

      <style>{accountPanelStyles}</style>
    </section>
  );
}

const accountPanelStyles = `
  .account-panel {
    background: white;
    border: 3px solid var(--ink);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    padding: 1.5rem;
    max-width: 1100px;
    margin: 0 auto 2rem;
  }

  .account-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .badge {
    background: var(--blue);
    color: white;
    font-family: var(--font-display);
    font-size: 0.9rem;
    letter-spacing: 2px;
    padding: 4px 10px;
    border: 2px solid var(--ink);
    border-radius: 2px;
  }

  .account-title {
    font-family: var(--font-display);
    font-size: 1.8rem;
    letter-spacing: 1px;
    color: var(--ink);
    flex: 1;
  }

  .account-subtitle {
    font-family: var(--font-display);
    font-size: 1.2rem;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
  }

  .auth-tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .auth-tab,
  .logout-btn,
  .account-primary-btn {
    border: 3px solid var(--ink);
    border-radius: var(--radius);
    box-shadow: 3px 3px 0 var(--ink);
    transition: all 0.15s;
  }

  .auth-tab {
    background: white;
    color: var(--ink);
    font-family: var(--font-display);
    font-size: 1rem;
    letter-spacing: 1px;
    padding: 0.5rem 0.9rem;
  }

  .auth-tab.active,
  .auth-tab:hover {
    background: var(--yellow);
  }

  .auth-form {
    display: grid;
    gap: 0.85rem;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-family: var(--font-display);
    font-size: 0.85rem;
    letter-spacing: 2px;
    color: #555;
  }

  .form-field input {
    min-height: 42px;
    border: 3px solid var(--ink);
    border-radius: var(--radius);
    padding: 0.55rem 0.75rem;
    font-family: var(--font-body);
    font-size: 1rem;
    color: var(--ink);
    background: var(--paper);
  }

  .form-field input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .account-primary-btn,
  .logout-btn {
    background: var(--red);
    color: white;
    font-family: var(--font-display);
    letter-spacing: 2px;
    padding: 0.7rem 1rem;
  }

  .account-primary-btn:hover:not(:disabled),
  .logout-btn:hover {
    background: var(--ink);
    transform: translate(-1px, -1px);
  }

  .account-primary-btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .logout-btn {
    background: white;
    color: var(--ink);
  }

  .account-error {
    background: #fff0f0;
    border: 2px solid var(--red);
    color: var(--red);
    padding: 0.65rem 0.75rem;
    font-family: var(--font-body);
    font-weight: 700;
  }

  .account-muted {
    color: #666;
    font-family: var(--font-body);
    font-style: italic;
  }

  .profile-grid,
  .profile-library-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .profile-card,
  .comic-list-block {
    border: 2px solid var(--ink);
    border-radius: var(--radius);
    background: var(--paper);
    padding: 1rem;
  }

  .profile-fields {
    display: grid;
    gap: 0.65rem;
    font-family: var(--font-body);
  }

  .profile-fields dt {
    font-family: var(--font-display);
    letter-spacing: 1px;
    color: #555;
  }

  .profile-fields dd {
    word-break: break-word;
    font-weight: 700;
  }

  .lookup-card {
    display: grid;
    gap: 0.75rem;
  }

  .profile-library-grid {
    margin-top: 1rem;
  }

  .profile-comics {
    display: grid;
    gap: 0.75rem;
    max-height: 360px;
    overflow: auto;
    padding-right: 0.25rem;
  }

  .profile-comic-card {
    display: grid;
    grid-template-columns: 82px minmax(0, 1fr);
    gap: 0.75rem;
    align-items: start;
    background: white;
    border: 2px solid var(--ink);
    border-radius: var(--radius);
    padding: 0.65rem;
    width: 100%;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: transform 0.15s, box-shadow 0.15s;
  }

  .profile-comic-card:hover,
  .profile-comic-card:focus-visible {
    box-shadow: 3px 3px 0 var(--ink);
    transform: translate(-1px, -1px);
  }

  .profile-comic-image {
    width: 82px;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border: 2px solid var(--ink);
    background: var(--sky);
  }

  .profile-comic-copy {
    min-width: 0;
  }

  .profile-comic-copy h4 {
    font-family: var(--font-display);
    font-size: 1.1rem;
    letter-spacing: 1px;
  }

  .profile-comic-copy p {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    font-family: var(--font-body);
    font-size: 0.9rem;
    line-height: 1.35;
    color: #555;
  }

  .profile-panel-count {
    display: inline-block;
    margin-top: 0.4rem;
    font-family: var(--font-display);
    font-size: 0.8rem;
    letter-spacing: 1px;
    color: var(--blue);
  }

  .preview-backdrop {
    position: fixed;
    inset: 0;
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: rgba(13, 13, 13, 0.72);
  }

  .comic-preview-dialog {
    width: min(980px, 100%);
    max-height: min(86vh, 900px);
    overflow: auto;
    background: var(--paper);
    border: 4px solid var(--ink);
    border-radius: var(--radius);
    box-shadow: var(--shadow-lg);
    padding: 1.25rem;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }

  .preview-title {
    margin-top: 0.5rem;
    font-family: var(--font-display);
    font-size: 2rem;
    letter-spacing: 2px;
    color: var(--ink);
  }

  .preview-close-btn {
    background: var(--red);
    color: white;
    border: 3px solid var(--ink);
    border-radius: var(--radius);
    box-shadow: 3px 3px 0 var(--ink);
    padding: 0.55rem 0.85rem;
    font-family: var(--font-display);
    letter-spacing: 1px;
  }

  .preview-close-btn:hover {
    background: var(--ink);
  }

  .preview-description {
    max-width: 760px;
    margin-bottom: 1rem;
    font-family: var(--font-body);
    font-weight: 700;
    line-height: 1.45;
    color: #444;
  }

  .preview-panels {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }

  .preview-panel {
    position: relative;
    overflow: hidden;
    background: white;
    border: 3px solid var(--ink);
    box-shadow: var(--shadow);
  }

  .preview-panel img {
    display: block;
    width: 100%;
    aspect-ratio: 1 / 1;
    object-fit: cover;
  }

  .preview-panel figcaption {
    border-top: 2px solid var(--ink);
    background: var(--yellow);
    padding: 0.65rem 0.75rem;
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 0.9rem;
    line-height: 1.35;
    color: var(--ink);
  }

  .preview-panel-number {
    position: absolute;
    top: 6px;
    left: 6px;
    z-index: 1;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--yellow);
    color: var(--ink);
    border: 2px solid var(--ink);
    border-radius: 50%;
    font-family: var(--font-display);
  }

  @media (max-width: 820px) {
    .profile-grid,
    .profile-library-grid {
      grid-template-columns: 1fr;
    }

    .preview-panels {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 560px) {
    .preview-backdrop {
      padding: 0.75rem;
      align-items: flex-start;
    }

    .preview-header {
      flex-direction: column;
    }

    .preview-panels {
      grid-template-columns: 1fr;
    }
  }
`;
