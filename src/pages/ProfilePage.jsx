import React from 'react';
import AccountPanel from '../components/AccountPanel';

export default function ProfilePage({
  auth,
  libraryError,
  myComics,
  myComicsLoading,
  onLoadProfileComics,
  profileComics,
  profileComicsLoading,
}) {
  return (
    <>
      {libraryError && (
        <div className="status-banner error" role="alert">
          <strong>Profile request failed:</strong> {libraryError}
        </div>
      )}

      <AccountPanel
        auth={auth}
        myComics={myComics}
        myComicsLoading={myComicsLoading}
        profileComics={profileComics}
        profileComicsLoading={profileComicsLoading}
        onLoadProfileComics={onLoadProfileComics}
      />
    </>
  );
}
