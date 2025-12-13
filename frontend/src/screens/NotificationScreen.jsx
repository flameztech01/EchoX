import React, { useState, useEffect } from 'react'
import { 
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation
} from '../slices/notificationApiSlice.js'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { FiCheck, FiTrash2, FiClock, FiUser, FiHeart, FiMessageSquare, FiUsers, FiHash, FiBell } from 'react-icons/fi'
import { BsHeartFill } from 'react-icons/bs'

const NotificationScreen = () => {
  const { data: notificationsData, isLoading, refetch } = useGetNotificationsQuery()
  const { data: unreadCountData } = useGetUnreadCountQuery()
  const [markAsRead] = useMarkNotificationAsReadMutation()
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()
  const [clearAll] = useClearAllNotificationsMutation()
  const [filter, setFilter] = useState('all')
  const [expandedNotification, setExpandedNotification] = useState(null)
  
  const { userInfo } = useSelector((state) => state.auth)
  
  const notifications = notificationsData?.notifications || []
  const unreadCount = unreadCountData?.unreadCount || 0
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId).unwrap()
      refetch()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap()
      refetch()
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }
  
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId).unwrap()
      refetch()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }
  
  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      try {
        await clearAll().unwrap()
        refetch()
      } catch (error) {
        console.error('Error clearing all notifications:', error)
      }
    }
  }
  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true
    if (filter === 'unread') return !notification.isRead
    return notification.type === filter
  })
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
      case 'post_like':
      case 'comment_like':
        return <BsHeartFill className="icon liked" />
      case 'comment':
        return <FiMessageSquare className="icon" />
      case 'follow':
        return <FiUser className="icon" />
      case 'new_follower':
        return <FiUsers className="icon" />
      case 'mention':
        return <FiHash className="icon" />
      default:
        return <FiBell className="icon" />
    }
  }
  
  const getNotificationText = (notification) => {
    const senderName = notification.sender?.username || 'Someone'
    
    switch (notification.type) {
      case 'like':
        return `${senderName} liked your post`
      case 'post_like':
        return `${senderName} liked your post`
      case 'comment':
        return `${senderName} commented on your post`
      case 'comment_like':
        return `${senderName} liked your comment`
      case 'follow':
        return `${senderName} started following you`
      case 'new_follower':
        return `${senderName} is now following you`
      case 'mention':
        return `${senderName} mentioned you in a comment`
      case 'system':
        return notification.message || 'System notification'
      default:
        return `${senderName} interacted with you`
    }
  }
  
  const formatTime = (date) => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffMs = now - notificationDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return notificationDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
  
  if (isLoading) {
    return (
      <div className="peak">
        {[1, 2, 3].map((i) => (
          <div key={i} className="high loading-skeleton">
            <div className="profileSide">
              <div className="postProfile">
                <div className="skeleton-avatar"></div>
                <div className="skeleton-text"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="search-container">
      {/* Header */}
      <div className="search-header" style={{ flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{
                marginLeft: '10px',
                background: 'linear-gradient(135deg, #1EA1D9, #8B33BB)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {unreadCount} new
              </span>
            )}
          </h2>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="follow-btn"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                background: unreadCount === 0 ? 'var(--border-color)' : 'linear-gradient(135deg, #1EA1D9, #8B33BB)',
                cursor: unreadCount === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <FiCheck style={{ marginRight: '5px' }} /> Mark all read
            </button>
            
            <button
              onClick={handleClearAll}
              disabled={notifications.length === 0}
              className="unfollow-btn"
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                cursor: notifications.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <FiTrash2 style={{ marginRight: '5px' }} /> Clear all
            </button>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          overflowX: 'auto',
          paddingBottom: '5px',
          width: '100%'
        }}>
          {['all', 'unread', 'like', 'comment', 'follow'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              style={{
                padding: '8px 16px',
                background: filter === filterType 
                  ? 'linear-gradient(135deg, #1EA1D9, #8B33BB)' 
                  : 'var(--card-bg)',
                color: filter === filterType ? 'white' : 'var(--text-primary)',
                border: `1px solid ${filter === filterType ? 'transparent' : 'var(--border-color)'}`,
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s ease'
              }}
            >
              {filterType === 'all' && 'All'}
              {filterType === 'unread' && 'Unread'}
              {filterType === 'like' && 'Likes'}
              {filterType === 'comment' && 'Comments'}
              {filterType === 'follow' && 'Follows'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Notifications List */}
      <div className="search-results">
        {filteredNotifications.length === 0 ? (
          <div className="no-results">
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔔</div>
            <h3>No notifications</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filter === 'all' 
                ? "You're all caught up! Check back later for new notifications." 
                : `No ${filter} notifications`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div 
              key={notification._id} 
              className="follower-card"
              style={{
                opacity: notification.isRead ? 0.8 : 1,
                borderLeft: notification.isRead ? 'none' : '4px solid #1EA1D9',
                position: 'relative'
              }}
              onClick={() => {
                if (!notification.isRead) {
                  handleMarkAsRead(notification._id)
                }
                setExpandedNotification(expandedNotification === notification._id ? null : notification._id)
              }}
            >
              <div className="follower-info" style={{ alignItems: 'flex-start' }}>
                {/* Notification Icon */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{
                    color: notification.isRead ? 'var(--text-secondary)' : '#1EA1D9',
                    fontSize: '20px'
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                </div>
                
                {/* Notification Content */}
                <div className="follower-details" style={{ flex: 1 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    {notification.sender ? (
                      <Link 
                        to={`/profile/${notification.sender._id}`}
                        className="follower-name"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {notification.sender.name || notification.sender.username}
                      </Link>
                    ) : (
                      <span className="follower-name">User</span>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        color: 'var(--text-tertiary)',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FiClock size={12} /> {formatTime(notification.createdAt)}
                      </span>
                      
                      {!notification.isRead && (
                        <span style={{
                          width: '8px',
                          height: '8px',
                          background: 'linear-gradient(135deg, #1EA1D9, #8B33BB)',
                          borderRadius: '50%',
                          marginLeft: '5px'
                        }}></span>
                      )}
                    </div>
                  </div>
                  
                  <p style={{
                    margin: '0 0 8px 0',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    lineHeight: '1.4'
                  }}>
                    {getNotificationText(notification)}
                  </p>
                  
                  {/* Notification Message (if any) */}
                  {notification.message && expandedNotification === notification._id && (
                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '8px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <p style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontSize: '13px',
                        fontStyle: 'italic'
                      }}>
                        {notification.message}
                      </p>
                    </div>
                  )}
                  
                  {/* Post/Comment Preview */}
                  {notification.post && expandedNotification === notification._id && (
                    <div style={{
                      background: 'var(--bg-secondary)',
                      padding: '10px',
                      borderRadius: '8px',
                      marginTop: '10px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <p style={{
                        margin: 0,
                        color: 'var(--text-secondary)',
                        fontSize: '13px'
                      }}>
                        <strong>Post: </strong>
                        {notification.post.text 
                          ? notification.post.text.substring(0, 100) + (notification.post.text.length > 100 ? '...' : '')
                          : 'View post'}
                      </p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  {expandedNotification === notification._id && (
                    <div style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '12px'
                    }}>
                      {notification.post && (
                        <Link 
                          to={`/post/${notification.post._id}`}
                          className="follow-btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            textDecoration: 'none'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Post
                        </Link>
                      )}
                      
                      {notification.comment && (
                        <Link 
                          to={`/comment/${notification.comment._id}`}
                          className="follow-btn"
                          style={{
                            padding: '6px 12px',
                            fontSize: '13px',
                            textDecoration: 'none'
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Comment
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="follower-actions" style={{ flexDirection: 'column', gap: '5px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkAsRead(notification._id)
                  }}
                  className="icon-button"
                  style={{
                    padding: '8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={notification.isRead ? "Mark as unread" : "Mark as read"}
                >
                  <FiCheck size={16} color={notification.isRead ? "var(--text-secondary)" : "#1EA1D9"} />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteNotification(notification._id)
                  }}
                  className="icon-button"
                  style={{
                    padding: '8px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Delete notification"
                >
                  <FiTrash2 size={16} color="var(--text-secondary)" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Bottom Stats */}
      {notifications.length > 0 && (
        <div style={{
          background: 'var(--card-bg)',
          padding: '20px',
          borderRadius: '16px',
          marginTop: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'var(--text-primary)'
              }}>
                {notifications.length}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                Total
              </div>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1EA1D9'
              }}>
                {unreadCount}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                Unread
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationScreen