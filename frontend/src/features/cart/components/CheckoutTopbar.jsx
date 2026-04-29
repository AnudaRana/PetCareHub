import logo from "../../../assets/logo-b.png";

export default function CheckoutTopbar({ onDashboard, onCancel, showCancel = true }) {
  return (
    <header className="store-topbar">
      <div className="store-topbar-inner">
        <div className="store-brand" onClick={onDashboard}>
          <img src={logo} alt="PetCareHub Logo" className="store-logo" />
          <div className="store-brand-text">
            <span className="store-brand-name">PetCare Hub</span>
            <span className="store-brand-tag">PREMIUM STORE</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div className="store-actions">
          <button className="store-dashboard-btn" onClick={onDashboard}>Go to Dashboard</button>
          {showCancel && (
            <button className="btn btn-cancel" style={{ borderRadius: '50px', padding: '0 20px', height: '48px' }} onClick={onCancel}>Cancel Order</button>
          )}
        </div>
      </div>
    </header>
  );
}
