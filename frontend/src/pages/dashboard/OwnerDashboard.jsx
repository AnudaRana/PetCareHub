import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './DashboardLayout';
import './Dashboard.css';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';


const OwnerDashboard = () => {
  const { profile, loading } = useAuth();

  const ownerMenu = [
    { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
    { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
    { name: 'My Pets', icon: PetsOutlinedIcon, path: '/dashboard/pets' },
    { name: 'My Appointements', icon: CalendarTodayOutlinedIcon, path: '/dashboard/appointments' },
    { name: 'Doctor Channeling', icon: BookOnlineOutlinedIcon, path: '/dashboard/channeling' },
    { name: 'Shop', icon: StoreOutlinedIcon, path: '/dashboard/shop' },
    { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout menuItems={ownerMenu} profile={profile}>
      <h2>Welcome back, {profile?.name}!</h2>
      <div className="stats-grid">
        <p>You have 3 pets registered.</p>
      </div>
    </DashboardLayout>
  );
};

export default OwnerDashboard;