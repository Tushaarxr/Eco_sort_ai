# ♻️ EcoSort AI: E-Waste Management Assistant

EcoSort AI is a smart mobile application designed to tackle the rising problem of electronic waste by using AI and real-time geolocation services. It helps users identify different types of e-waste, guides them on proper disposal methods, and navigates them to nearby certified recycling centers.

---

## 🚀 Features

- 🔍 **AI-Powered Waste Recognition**: Uses Google's Gemini API to classify devices such as batteries, mobile phones, and electronic appliances.
- 📍 **Geolocation Integration**: Recommends nearby certified recycling centers based on the user's current location.
- 📚 **Awareness & Guidance**: Educates users on e-waste disposal practices, environmental impact, and safe handling procedures.
- ☁️ **Firebase Backend**: Real-time data handling, authentication, and cloud functions.

---

## 🛠️ Tech Stack

- **Frontend**: Flutter / React Native (based on implementation)
- **Backend**: Firebase (Authentication, Firestore, Realtime DB)
- **AI Integration**: Google Gemini API
- **Geolocation**: Google Maps API / Geolocator package
- **Storage**: Firebase Storage

---

## 📱 Screenshots

> (Insert relevant app screenshots or mockups here for better understanding)

---

## 🧠 How It Works

1. User uploads or scans an image of the e-waste.
2. Gemini API classifies the item using AI models.
3. Firebase stores classification results and user data securely.
4. The app fetches and displays the nearest recycling centers using geolocation.
5. User receives guidance on safe disposal methods for that item.

---

## 🔧 Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tushaarxr/ecosort-ai.git
   cd ecosort-ai
