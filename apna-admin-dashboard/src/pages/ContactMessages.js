// src/pages/ContactMessages.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaEnvelope, 
  FaPhone, 
  FaUser, 
  FaSearch, 
  FaReply, 
  FaCheck, 
  FaTimes,
  FaCalendarAlt,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { 
  collection, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  onSnapshot,
  deleteDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import DashboardLayout from '../components/layout/DashboardLayout';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch contact messages with real-time updates
  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'contactMessages'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messagesList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching contact messages:", error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Filter messages based on search term and status
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      (message.name && message.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.email && message.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (message.message && message.message.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Mark message as read
  const markAsRead = async (messageId) => {
    try {
      await updateDoc(doc(db, 'contactMessages', messageId), {
        status: 'read',
        readAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteDoc(doc(db, 'contactMessages', messageId));
      } catch (error) {
        console.error('Error deleting message:', error);
        alert('Failed to delete message.');
      }
    }
  };
  
  // Open message details modal
  const openMessageDetails = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
    
    // Mark as read if it's new
    if (message.status === 'new') {
      markAsRead(message.id);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get message status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'new':
        return <span className="status-badge new"><FaEnvelope /> New</span>;
      case 'read':
        return <span className="status-badge read"><FaCheck /> Read</span>;
      case 'replied':
        return <span className="status-badge replied"><FaReply /> Replied</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <DashboardLayout title="Contact Messages">
      <MessagesHeader>
        <SearchContainer>
          <SearchIconWrapper>
            <FaSearch />
          </SearchIconWrapper>
          <SearchInput 
            type="text" 
            placeholder="Search by name, email or message content..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>
        
        <FilterContainer>
          <FilterLabel>Status:</FilterLabel>
          <StatusSelect 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </StatusSelect>
        </FilterContainer>
      </MessagesHeader>
      
      <StatsRow>
        <StatCard>
          <StatIcon className="new"><FaEnvelope /></StatIcon>
          <StatContent>
            <StatCount>{messages.filter(m => m.status === 'new').length}</StatCount>
            <StatLabel>New Messages</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon className="read"><FaCheck /></StatIcon>
          <StatContent>
            <StatCount>{messages.filter(m => m.status === 'read').length}</StatCount>
            <StatLabel>Read Messages</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon className="replied"><FaReply /></StatIcon>
          <StatContent>
            <StatCount>{messages.filter(m => m.status === 'replied').length}</StatCount>
            <StatLabel>Replied Messages</StatLabel>
          </StatContent>
        </StatCard>
        
        <StatCard>
          <StatIcon className="total"><FaEnvelope /></StatIcon>
          <StatContent>
            <StatCount>{messages.length}</StatCount>
            <StatLabel>Total Messages</StatLabel>
          </StatContent>
        </StatCard>
      </StatsRow>
      
      {loading ? (
        <LoadingMessage>Loading messages...</LoadingMessage>
      ) : (
        <MessagesContainer>
          {filteredMessages.length > 0 ? (
            filteredMessages.map(message => (
              <MessageCard key={message.id} className={message.status}>
                <MessageHeader>
                  <MessageName>
                    <FaUser className="icon" /> {message.name || 'Unknown'}
                  </MessageName>
                  {getStatusIcon(message.status)}
                </MessageHeader>
                
                <ContactDetails>
                  {message.email && (
                    <ContactItem>
                      <ContactLabel><FaEnvelope /> Email:</ContactLabel>
                      <ContactValue>
                        <a href={`mailto:${message.email}`} title="Send email">
                          {message.email}
                          <FaExternalLinkAlt className="external-icon" />
                        </a>
                      </ContactValue>
                    </ContactItem>
                  )}
                  
                  {message.phone && (
                    <ContactItem>
                      <ContactLabel><FaPhone /> Phone:</ContactLabel>
                      <ContactValue>
                        <a href={`tel:${message.phone}`} title="Call this number">
                          {message.phone}
                          <FaExternalLinkAlt className="external-icon" />
                        </a>
                      </ContactValue>
                    </ContactItem>
                  )}
                  
                  <ContactItem>
                    <ContactLabel><FaCalendarAlt /> Received:</ContactLabel>
                    <ContactValue>{formatDate(message.createdAt)}</ContactValue>
                  </ContactItem>
                </ContactDetails>
                
                <MessageContent>
                  {message.message}
                </MessageContent>
                
                <MessageActions>
                  {message.status === 'new' && (
                    <ActionButton 
                      className="read"
                      onClick={() => markAsRead(message.id)}
                    >
                      <FaCheck /> Mark as Read
                    </ActionButton>
                  )}
                  
                  <ActionButton 
                    className="view"
                    onClick={() => openMessageDetails(message)}
                  >
                    <FaEnvelope /> View Details
                  </ActionButton>
                  
                  <ActionButton 
                    className="delete"
                    onClick={() => deleteMessage(message.id)}
                  >
                    <FaTimes /> Delete
                  </ActionButton>
                </MessageActions>
              </MessageCard>
            ))
          ) : (
            <EmptyMessage>
              No messages found. {searchTerm && 'Try a different search term.'}
            </EmptyMessage>
          )}
        </MessagesContainer>
      )}
      
      {/* Message Details Modal */}
      {showModal && selectedMessage && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>
              <h3>Message from {selectedMessage.name}</h3>
              <CloseButton onClick={() => setShowModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <MessageDetails>
                <DetailItem>
                  <DetailLabel>From:</DetailLabel>
                  <DetailValue>
                    {selectedMessage.name} 
                    (<a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>)
                  </DetailValue>
                </DetailItem>
                
                {selectedMessage.phone && (
                  <DetailItem>
                    <DetailLabel>Phone:</DetailLabel>
                    <DetailValue>
                      <a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a>
                    </DetailValue>
                  </DetailItem>
                )}
                
                <DetailItem>
                  <DetailLabel>Received:</DetailLabel>
                  <DetailValue>{formatDate(selectedMessage.createdAt)}</DetailValue>
                </DetailItem>
                
                <DetailItem>
                  <DetailLabel>Message:</DetailLabel>
                  <DetailValue className="message">{selectedMessage.message}</DetailValue>
                </DetailItem>
              </MessageDetails>
            </ModalBody>
            
            <ModalFooter>
              <CloseModalButton onClick={() => setShowModal(false)}>
                Close
              </CloseModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </DashboardLayout>
  );
};

// Styled Components
const MessagesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 380px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterLabel = styled.label`
  margin-right: 10px;
  font-weight: 500;
  color: #555;
`;

const StatusSelect = styled.select`
  padding: 12px 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #8e44ad;
    box-shadow: 0 0 0 3px rgba(142, 68, 173, 0.1);
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 20px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 15px;
  flex-shrink: 0;
  
  &.new {
    background-color: rgba(33, 150, 243, 0.1);
    color: #2196f3;
  }
  
  &.read {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }
  
  &.replied {
    background-color: rgba(156, 39, 176, 0.1);
    color: #9c27b0;
  }
  
  &.total {
    background-color: rgba(142, 68, 173, 0.1);
    color: #8e44ad;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatCount = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #666;
  height: 200px;
`;

const MessagesContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 25px;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const MessageCard = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  &.new {
    border-left: 4px solid #2196f3;
  }
  
  &.read {
    border-left: 4px solid #4caf50;
  }
  
  &.replied {
    border-left: 4px solid #9c27b0;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
`;

const MessageName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  
  .icon {
    margin-right: 8px;
    color: #666;
  }
`;

// Contact details section
const ContactDetails = styled.div`
  padding: 15px 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-wrap: wrap;
`;

const ContactItem = styled.div`
  margin-right: 25px;
  margin-bottom: 10px;
  font-size: 14px;
  
  &:last-child {
    margin-right: 0;
  }
`;

const ContactLabel = styled.span`
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #666;
  margin-bottom: 4px;
  
  svg {
    margin-right: 6px;
    color: #8e44ad;
  }
`;

const ContactValue = styled.span`
  color: #333;
  
  a {
    color: #2196f3;
    text-decoration: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    
    &:hover {
      color: #0b7dda;
      text-decoration: underline;
    }
    
    .external-icon {
      font-size: 10px;
      margin-left: 5px;
      opacity: 0.7;
    }
  }
`;

const MessageContent = styled.div`
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  flex-grow: 1;
  border-bottom: 1px solid #eee;
  white-space: pre-line;
`;

const MessageActions = styled.div`
  display: flex;
  padding: 15px 20px;
  gap: 10px;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  
  &.read {
    background-color: rgba(76, 175, 80, 0.1);
    color: #4caf50;
    
    &:hover {
      background-color: #4caf50;
      color: white;
    }
  }
  
  &.view {
    background-color: rgba(33, 150, 243, 0.1);
    color: #2196f3;
    
    &:hover {
      background-color: #2196f3;
      color: white;
    }
  }
  
  &.delete {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
    
    &:hover {
      background-color: #f44336;
      color: white;
    }
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  color: #666;
  font-size: 16px;
  grid-column: 1 / -1;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  
  &:hover {
    color: #333;
  }
`;

const ModalBody = styled.div`
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const MessageDetails = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background-color: #f9f9f9;
`;

const DetailItem = styled.div`
  margin-bottom: 15px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  color: #333;
  
  a {
    color: #2196f3;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  &.message {
    white-space: pre-line;
    padding: 15px;
    background-color: white;
    border-radius: 6px;
    border: 1px solid #eee;
    margin-top: 5px;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 20px 25px;
  border-top: 1px solid #eee;
`;

const CloseModalButton = styled.button`
  padding: 12px 25px;
  background-color: #8e44ad;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #7d3c98;
  }
`;

export default ContactMessages;