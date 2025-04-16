# Expense Tracker
Welcome to the **Expense Tracker**, a modern web application built with Next.js to help you manage your personal finances. This app allows you to track transactions, set budgets, and gain insights into your spending habits with an intuitive interface and dark theme support.

## Table of Contents
- Features
- Tech Stack
- Installation
- Usage

1.Features
- **Budget Planning**: Set monthly budgets for different categories (e.g., Food, Entertainment, Bills).
- **Transaction Tracking**: Add, view, and delete transactions with date, category, description, and amount.
- **Visual Insights**: View budget vs. actual spending with interactive bar charts.
- **Spending Insights**: Get real-time insights (e.g., over/under budget notifications).
- **Responsive Design**: Optimized for desktop and mobile devices.
- **Dark Theme**: Toggle between light and dark modes using Next.js themes.
- **Data Persistence**: Store data using MongoDB Atlas with a backend API.

2. Tech Stack
- **Frontend**: Next.js, React, Recharts (for charts), Tailwind CSS (for styling)
- **State Management**: React Hooks
- **Backend**: Node.js, Express (API routes)
- **Database**: MongoDB Atlas
- **UI Components**: shadcn/ui
- **Other**: axios (for API calls), next-themes (for theme support), sonner (for toasts)

3.Installation

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- MongoDB Atlas account (for database)

### Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   cd expense-tracker
2. Install Dependencies
   npm install
3. Setting up Environment Variables
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/expense-tracker?retryWrites=true&w=majority
4. Run the development Server
   npm run dev
