# 🏋️ GYM MEMBERSHIP MANAGEMENT SYSTEM

## 📖 Project Overview

A **highly secure** Node.js backend API for managing gym memberships. This system allows an Admin to manage gym members while members can view their own profiles and membership details.

---

## 🎯 Core Features

### 🔐 Authentication System

| Feature | Description |
|---------|-------------|
| **Admin Login** | Credentials matched against ENV variables |
| **Member Login** | Login using mobile number & password |
| **First-Time Password Change** | Members MUST change password on first login (initial password = phone number) |
| **JWT Token Based** | Secure token-based authentication |

---

### 👨‍💼 Admin Capabilities

| Action | Description |
|--------|-------------|
| **View All Members** | Get complete list of all gym members |
| **View Single Member** | Get details of a specific member |
| **Add New Member** | Register new gym member |
| **Update Member** | Modify member details |
| **Delete Member** | Remove member from system |

#### 📝 Add Member Payload

| Field | Required | Description |
|-------|----------|-------------|
| `name` | ✅ Yes | Member's full name |
| `mobile` | ✅ Yes | 10-digit mobile number (also initial password) |
| `start_date` | ✅ Yes | Membership start date |
| `duration` | ✅ Yes | Membership duration in days |
| `amount_paid` | ✅ Yes | Payment amount |
| `profile_pic` | ❌ No | Profile image (uploaded to Cloudinary) |
| `email` | ❌ No | Email address |
| `discount` | ❌ No | Discount percentage |
| `focus_note` | ❌ No | Special notes/focus areas |

---

### 👤 Member Capabilities

| Action | Description |
|--------|-------------|
| **View Own Profile** | See their personal details |
| **View Membership Status** | See days remaining, start date, end date |
| **Change Password** | Update their password |

---

## 🔒 Security Features