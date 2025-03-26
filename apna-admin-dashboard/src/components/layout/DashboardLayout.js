// src/components/layout/DashboardLayout.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaShoppingBag, 
  FaCreditCard, 
  FaTshirt, 
  FaUpload, 
  FaSignOutAlt, 
  FaChartLine,
  FaUsers,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaStar,
  FaRing,
  FaTag,
  FaHome,
  FaEnvelope,
  FaTicketAlt
} from 'react-icons/fa';
import { useAdminAuth } from '../../context/AdminAuthContext';
import NotificationsCenter from '../notifications/NotificationsCenter';

const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentAdmin } = useAdminAuth();

  // Check if we're on mobile and close sidebar by default
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <DashboardContainer>
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && <Overlay onClick={toggleSidebar} />}
      
      {/* Sidebar */}
      <Sidebar className={sidebarOpen ? 'open' : 'closed'}>
        <SidebarHeader>
          <h1>Apna Collection</h1>
          <p>Admin Panel</p>
        </SidebarHeader>
        
        <SidebarMenu>
          <SidebarMenuItem 
            to="/" 
            className={isActive('/') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaChartLine className="menu-icon" />
            <span>Dashboard</span>
          </SidebarMenuItem>
          
          <SidebarMenuItem 
            to="/orders" 
            className={isActive('/orders') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaShoppingBag className="menu-icon" />
            <span>Orders</span>
          </SidebarMenuItem>
          
          <SidebarMenuItem 
            to="/products" 
            className={isActive('/products') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaTshirt className="menu-icon" />
            <span>Products</span>
          </SidebarMenuItem>
          
          <SidebarMenuItem 
            to="/customers" 
            className={isActive('/customers') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaUsers className="menu-icon" />
            <span>Customers</span>
          </SidebarMenuItem>
          
          {/* Coupons Menu Item */}
          <SidebarMenuItem 
            to="/coupons" 
            className={isActive('/coupons') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaTicketAlt className="menu-icon" />
            <span>Coupons</span>
          </SidebarMenuItem>
          
          <SidebarMenuItem 
            to="/contact-messages" 
            className={isActive('/contact-messages') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaEnvelope className="menu-icon" />
            <span>Contact Messages</span>
          </SidebarMenuItem>
          
          <SidebarMenuItem 
            to="/featured-products" 
            className={isActive('/featured-products') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaHome className="menu-icon" />
            <span>Homepage Featured</span>
          </SidebarMenuItem>
          
          {/* End of Season Sale Menu Item */}
          <SidebarMenuItem 
            to="/end-of-season-products" 
            className={isActive('/end-of-season-products') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaTag className="menu-icon" />
            <span>End of Season Sale</span>
          </SidebarMenuItem>
          
          {/* Festive Products Menu Item */}
          <SidebarMenuItem 
            to="/festive-products" 
            className={isActive('/festive-products') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaStar className="menu-icon" />
            <span>Festive Collection</span>
          </SidebarMenuItem>
          
          {/* Wedding Products Menu Item */}
          <SidebarMenuItem 
            to="/wedding-products" 
            className={isActive('/wedding-products') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaRing className="menu-icon" />
            <span>Wedding Collection</span>
          </SidebarMenuItem>
          
          <SidebarMenuItem 
            to="/upload" 
            className={isActive('/upload') ? 'active' : ''}
            onClick={() => isMobile && setSidebarOpen(false)}
          >
            <FaUpload className="menu-icon" />
            <span>Upload Product</span>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt className="menu-icon" />
          <span>Logout</span>
        </LogoutButton>
      </Sidebar>
      
      {/* Main Content Area */}
      <MainContent className={sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}>
        {/* Header */}
        <DashboardHeader>
          <ToggleButton onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </ToggleButton>
          
          <PageTitle>{title}</PageTitle>
          
          <HeaderRight>
            <NotificationsCenter />
            <UserInfo>
              <UserName>{currentAdmin?.email || 'Admin User'}</UserName>
              <UserAvatar>
                <FaUserCircle />
              </UserAvatar>
            </UserInfo>
          </HeaderRight>
        </DashboardHeader>
        
        {/* Page Content */}
        <PageContent>
          {children}
        </PageContent>
      </MainContent>
    </DashboardContainer>
  );
};

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 5;
  animation: fadeIn 0.3s ease;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Sidebar = styled.div`
  width: 260px;
  background: linear-gradient(135deg, #8e44ad 0%, #5b2c6f 100%);
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 10;
  box-shadow: 2px 0 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &.closed {
    transform: translateX(-100%);
  }
  
  @media (max-width: 768px) {
    width: 240px;
    z-index: 15;
  }
`;

const SidebarHeader = styled.div`
  padding: 0 25px 25px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h1 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 5px;
    color: #fff;
    letter-spacing: 0.5px;
  }
  
  p {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
  }
`;

const SidebarMenu = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0 15px;
  overflow-y: auto;
  
  /* Custom scrollbar for webkit browsers */
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
`;

const SidebarMenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 14px 20px;
  margin-bottom: 5px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  border-radius: 10px;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateX(5px);
  }
  
  &.active {
    background-color: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-weight: 600;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .menu-icon {
    font-size: 18px;
    margin-right: 15px;
    min-width: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    margin-bottom: 3px;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  margin: 15px;
  padding: 14px 20px;
  font-size: 15px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 10px;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(244, 67, 54, 0.2);
    color: #fff;
  }
  
  .menu-icon {
    font-size: 18px;
    margin-right: 15px;
    min-width: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    margin-top: 10px;
    margin-bottom: 20px;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  margin-left: 260px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  &.sidebar-closed {
    margin-left: 0;
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`;

const DashboardHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 15px 20px;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #f0f0f0;
    color: #8e44ad;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 22px;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 18px;
    max-width: 50%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
`;

const UserName = styled.span`
  margin-right: 15px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #8e44ad;
  font-size: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const PageContent = styled.div`
  padding: 30px;
  flex-grow: 1;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

export default DashboardLayout;