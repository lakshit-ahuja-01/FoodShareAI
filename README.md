# 🍽️ FoodShare AI — Intelligent Food Waste Management System

An AI-powered platform that connects food donors with nearby NGOs in real-time to reduce food waste and feed people in need.

---

## 🚀 Features

### 🧠 AI-Based NGO Matching

* Automatically finds the best NGO based on:

  * 📍 Distance
  * ⏱ Food expiry time (urgency)
  * 📦 Quantity of food

### 📸 Image Upload (Cloudinary)

* Upload food images
* Stored securely using Cloudinary CDN

### 🗺️ Map Integration

* Interactive map using Leaflet
* Displays pickup location

### 📊 Dashboard

* View:

  * Total food donated
  * Active listings
  * Nearby NGOs
* Clean and fast UI (optimized without heavy images)

### 📋 Food Listings

* Detailed view with:

  * Images
  * Expiry time
  * Location
  * NGO recommendation

### 🔐 Authentication

* User login & registration
* Token-based authentication

---

## 🏗️ Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* ShadCN UI
* React Leaflet

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Cloud

* Cloudinary (Image Storage)

---

## 📁 Project Structure

```
AI_Food_Management_System/
│
├── Backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── config/
│
├── Frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── styles/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/foodshare-ai.git
cd foodshare-ai
```

---

### 2️⃣ Backend Setup

```bash
cd Backend
npm install
```

Create `.env` file:

```
PORT=4000
MONGO_URI=your_mongodb_uri

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key_here
```

Run backend:

```bash
node src/server.js
```

---

### 3️⃣ Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

## 🔗 API Endpoints

### 🥗 Food

| Method | Endpoint        | Description            |
| ------ | --------------- | ---------------------- |
| POST   | `/api/food/add` | Add food + AI matching |
| GET    | `/api/food`     | Get all food           |

---

### 🏢 NGO

| Method | Endpoint        | Description  |
| ------ | --------------- | ------------ |
| POST   | `/api/ngos/add` | Add NGO      |
| GET    | `/api/ngos`     | Get all NGOs |

---

## 🧠 AI Matching Logic

The system calculates a score based on:

```
Score =
  0.5 * urgency +
  0.3 * quantity +
  0.2 * distance
```

* **Urgency** → Based on expiry time
* **Quantity** → Food amount
* **Distance** → NGO proximity

---

## 📸 Image Handling

* Images uploaded via multipart/form-data
* Stored in Cloudinary
* URLs saved in MongoDB

---

## ⚠️ Known Issues & Fixes

### ❌ Hydration Error

* Caused by `localStorage` usage
* Fixed using `useEffect`

### ❌ Leaflet SSR Error

* Fixed using dynamic import (`ssr: false`)

---

## 🚀 Future Enhancements

* 🤖 AI food quality detection (fresh/spoiled)
* 📱 Mobile app integration
* 🔔 Real-time NGO notifications
* 📊 Advanced analytics dashboard
* 🧭 Auto route optimization for delivery

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📜 License

MIT License

---

## 👨‍💻 Author

**Jeevan Kumar**
AI Food Waste Management System 🚀

---

## 💡 Inspiration

Reducing food waste and helping communities through intelligent technology.

---

⭐ If you like this project, give it a star!


## 🌟 Open Source Program

This project is officially participating in GSSoC 2026.

We welcome contributors of all levels 🚀

Check Issues section to start contributing.
