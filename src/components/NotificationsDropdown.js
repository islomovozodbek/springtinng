"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";
import styles from "./NotificationsDropdown.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsDropdown() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id, type, is_read, created_at, reference_id,
          actor:actor_id ( username, photo_url )
        `)
        .eq("user_id", user.uid)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.is_read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.uid)
        .eq("is_read", false);
      
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notification.id);
        
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch (err) {
        console.error("Error marking as read:", err);
      }
    }
    
    setOpen(false);

    if (notification.type === "follow") {
      router.push(`/profile/${notification.actor.username}`);
    } else if (notification.type === "upvote" && notification.reference_id) {
      // You might not have a direct route to a single story, 
      // but they could go to their library or the feed
      router.push(`/dashboard`);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // in seconds

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!user) return null;

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        className={styles.bellBtn} 
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell size={20} strokeWidth={2} className={styles.bellIcon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className={styles.markReadBtn} onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>
          
          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet.</div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`${styles.item} ${!n.is_read ? styles.itemUnread : ""}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className={styles.itemAvatar}>
                    {n.actor?.photo_url ? (
                      <img src={n.actor.photo_url} alt="Avatar" />
                    ) : (
                      (n.actor?.username || "?")[0].toUpperCase()
                    )}
                  </div>
                  <div className={styles.itemContent}>
                    <p className={styles.itemText}>
                      <strong>@{n.actor?.username}</strong>{" "}
                      {n.type === "follow" && "started following you"}
                      {n.type === "upvote" && "upvoted your sprint"}
                    </p>
                    <span className={styles.itemTime}>{formatTime(n.created_at)}</span>
                  </div>
                  {!n.is_read && (
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", marginTop: 6 }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
