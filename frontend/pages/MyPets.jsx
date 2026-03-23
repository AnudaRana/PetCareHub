  import React from 'react';
import OwnerSidebar from '../components/owner/OwnerSidebar';
import MyPets from '../components/owner/MyPets';
import useCurrentUser from '../hooks/useCurrentUser';
import '../styles/Dashboard.css';

const MyPetsPage = () => {
  const user = useCurrentUser();

  return (
    <div className="dashboard-layout">
      <OwnerSidebar activeTab="my-pets" user={user} />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-home">Dashboard</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">My Pets</span>
          </div>

          <div className="topbar-right">
            <div className="topbar-user-section">
              <span className="topbar-greeting">
                Welcome, <strong>{user.fullName}</strong>
              </span>
              <div className="topbar-avatar" title="Profile">
                {user.initials}
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <MyPets />
        </main>
      </div>
    </div>
  );
};

export default MyPetsPage;