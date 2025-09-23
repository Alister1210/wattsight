# ⚡ Wattsight: Electricity Consumption Analysis & Forecasting

Wattsight is a sleek and interactive **electricity consumption analysis and forecasting dashboard** for Indian states. Built with **React, TypeScript, and Supabase (PostgreSQL)**, it provides real-time insights and visualizations of power usage trends, weather impacts, and model-driven forecasts.

## 🚀 Features

### 📊 **Data-Driven Visualizations**

- **Real-time electricity consumption trends** across Indian states.
- **Interactive charts & graphs** using Recharts/D3.js.
- **Weather impact analysis** (temperature, humidity, wind speed correlation with power demand).
- **Regional & historical comparisons** with intuitive drill-down features.

### 🤖 **AI-Powered Forecasting**

- **Daily automated forecasts** for energy consumption using machine learning models.
- **Model performance tracking** (MAE, RMSE, Accuracy).
- **Confidence intervals** for better prediction reliability.

### 🌐 **Modern Tech Stack**

- **Frontend:** React (Vite) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL) + FastAPI
- **Data Sources:** Public weather APIs & Supabase database
- **Charts & Graphs:** Recharts/D3.js for rich visualizations

### 🔒 **Secure & Scalable**

- **Role-based access control (RLS) with Supabase.**
- **Authentication & authorization** for secure data access.
- **Optimized for performance** with serverless database queries.

---

## 🛠️ Installation & Setup

### 1️⃣ **Clone the Repository**

```sh
git clone https://github.com/Alister1210/wattsight.git
cd wattsight
```

### 2️⃣ **Install Dependencies**

```sh
npm install
```

### 3️⃣ **Set Up Environment Variables**

Create a `.env` file in the root directory and add your Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4️⃣ **Run the Application**

```sh
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📷 Screenshots

![Wattsight Dashboard](./screenshots/dashboard.png)

---

## 📅 Roadmap

🔹 Data Source: Kaggle
🔹 Data Pre-processing: Python
🔹 Model training : XgBoost
🔹 Forecasts saved to PostgreSQL database
🔹 Data fetched from database and visualized in frontend

---

## 📜 License

Wattsight is open-source under the **MIT License**.

---

## 👨‍💻 Contributors

🔹 **Your Name** - [GitHub](https://github.com/Alister1210)  
🔹 **Other Contributors**

---

### 🌟 If you find Wattsight useful, please ⭐ star the repo and contribute! 🚀
