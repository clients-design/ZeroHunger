# ZeroHunger 🍽️

A comprehensive **Food Distribution Management System** designed to help NGOs, government agencies, and food banks optimize their food distribution operations, reduce wastage, and ensure food reaches those in need.

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🌟 Features

### 📊 Dashboard
- Real-time overview of total inventory, daily demand forecast, and distribution status
- Expiry status tracking (Urgent, Warning, Safe)
- Interactive charts for supply vs demand analysis

### 🏢 Organization Management
- Add, edit, and delete organizations (NGOs, Government, Trusts)
- Track contact details and location information

### 📍 Centre Management
- Manage distribution centres with GPS coordinates
- Filter centres by organization
- Interactive map visualization

### 📦 Inventory Management
- Track food items with categories and quantities
- Automatic expiry status calculation
- Custom category support
- Filter by organization, centre, and status

### 🚚 Distribution Runs
- Plan and track delivery routes
- Assign drivers and vehicles
- Route optimization suggestions
- Real-time status updates

### 📈 Reports & Forecasting
- AI-powered demand forecasting
- Supply vs demand trend analysis
- Wastage tracking and prevention
- Centre-wise demand breakdown

### 🗺️ Geographic Visualization
- Interactive Leaflet.js map
- Demand heatmap by centre
- Distribution route visualization

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, JavaScript, Bootstrap 5 |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas |
| **Charts** | Chart.js |
| **Maps** | Leaflet.js |
| **Authentication** | JWT with bcrypt |

## 📦 Installation

### Prerequisites
- Node.js 18.x or higher
- MongoDB Atlas account (or local MongoDB)
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/clients-design/ZeroHunger.git
   cd ZeroHunger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/zerohunger
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Seed the database** (optional - adds demo data)
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 👤 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@zerohunger.com | admin123 |
| Operator | operator@foodbank.org | operator123 |

## 📁 Project Structure

```
ZeroHunger/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── api.js
│   ├── pages/
│   │   └── login.html
│   └── index.html
├── server/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Centre.js
│   │   ├── DemandLog.js
│   │   ├── DistributionRun.js
│   │   ├── Inventory.js
│   │   ├── Organization.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── centres.js
│   │   ├── demand.js
│   │   ├── distribution.js
│   │   ├── inventory.js
│   │   └── organizations.js
│   ├── seed/
│   │   └── seedData.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

### Organizations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/organizations` | Get all organizations |
| POST | `/api/organizations` | Create organization |
| PUT | `/api/organizations/:id` | Update organization |
| DELETE | `/api/organizations/:id` | Delete organization |

### Centres
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/centres` | Get all centres |
| POST | `/api/centres` | Create centre |
| PUT | `/api/centres/:id` | Update centre |
| DELETE | `/api/centres/:id` | Delete centre |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | Get inventory (with filters) |
| POST | `/api/inventory` | Add inventory item |
| PUT | `/api/inventory/:id` | Update item |
| DELETE | `/api/inventory/:id` | Delete item |

### Demand
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/demand` | Get demand logs |
| GET | `/api/demand/forecast` | Get demand forecast |
| POST | `/api/demand` | Log demand |

### Distribution
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/distribution` | Get distribution runs |
| POST | `/api/distribution` | Create run |
| POST | `/api/distribution/:id/optimize` | Optimize route |

## 📊 Screenshots

### Dashboard
The main dashboard provides an at-a-glance view of your food distribution operations.

### Inventory Management
Track all food items with real-time expiry status updates.

### Distribution Planning
Plan and optimize delivery routes for maximum efficiency.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bootstrap](https://getbootstrap.com/) for the UI framework
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Leaflet](https://leafletjs.com/) for interactive maps
- [MongoDB Atlas](https://www.mongodb.com/atlas) for cloud database

---

**Built with ❤️ to fight hunger and reduce food waste.**
