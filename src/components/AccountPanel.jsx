import React, { useState } from 'react';

function ComicList({ title, comics, emptyText }) {
  return (
    <div className="comic-list-block">
      <h3 className="account-subtitle">{title}</h3>
      {comics.length > 0 ? (
        <div className="profile-comics">
          {comics.map(comic => (
            <article className="profile-comic-card" key={comic.uuid || comic._id}>
              {comic.url && (
                <img className="profile-comic-image" src={comic.url} alt={comic.name} />
              )}
              <div className="profile-comic-copy">
                <h4>{comic.name}</h4>
                <p>{comic.description}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="account-muted">{emptyText}</p>
      )}
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
        />
        <ComicList
          title="Profile Comics"
          comics={profileComics}
          emptyText={profileComicsLoading ? 'Loading comics...' : 'Enter a UUID to view public comics.'}
        />
      </div>

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

  @media (max-width: 820px) {
    .profile-grid,
    .profile-library-grid {
      grid-template-columns: 1fr;
    }
  }
`;
