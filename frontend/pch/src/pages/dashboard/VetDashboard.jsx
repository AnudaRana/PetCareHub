import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const VetDashboard = () => {
    const { hasRole } = useAuth();
    const navigate = useNavigate();

    return (
        <div>
            {/* Vet content */}
            {hasRole('ADMIN') && <button onClick={() => navigate('/admin-dashboard')}>Switch to Admin</button>}
        </div>
    );
};

export default VetDashboard

