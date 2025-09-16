# Sahha Wellness Dashboard Management

## Quick Start

The dashboard is currently **RUNNING** on http://localhost:3000

## Management Scripts

Three convenience scripts are provided for managing the dashboard:

### 1. Start Dashboard
```bash
./start-dashboard.sh
```
- Kills any existing processes on port 3000
- Starts the Next.js development server in the background
- Saves the process ID to `dashboard.pid`
- Logs output to `dashboard.log`

### 2. Stop Dashboard
```bash
./stop-dashboard.sh
```
- Gracefully stops the dashboard using the saved PID
- Cleans up the PID file
- Ensures port 3000 is freed

### 3. Check Status
```bash
./dashboard-status.sh
```
- Shows if the dashboard is running
- Displays process details
- Tests API endpoints
- Shows recent log entries

## Access Points

- **Main Dashboard**: http://localhost:3000
- **API Endpoint**: http://localhost:3000/api/sahha/webhook
- **Profile Manager**: http://localhost:3000 (default view)
- **Executive Dashboard**: Accessible via sidebar navigation
- **Behavioral Intelligence**: Accessible via sidebar navigation

## Key Features

### Executive Dashboard
- **Health Scores View**: Organization-wide health metrics
- **Activity Intelligence**: Department activity analysis with dual Y-axis charts
- **Sleep Intelligence**: Sleep patterns and quality metrics
- **Data Completeness**: Tracking data collection rates
- **Department Matrix**: Comprehensive performance metrics table

### Behavioral Intelligence
- **Overview Tab**: Interactive horizontal stacked bar charts
- **Individual Archetypes**: Detailed employee archetype table
- **Department Analysis**: Multiple views including:
  - Archetype Distribution (interactive charts)
  - Performance Matrix (expandable details)
  - Combined View (both charts and matrix)

### Interactive Features
- Click on department segments to filter all views
- Power BI-style cross-filtering
- Expandable rows in matrix views
- Real-time webhook data integration

## Troubleshooting

### Dashboard Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Force kill any process on port 3000
kill -9 $(lsof -ti:3000)

# Then start the dashboard
./start-dashboard.sh
```

### View Logs
```bash
# View real-time logs
tail -f dashboard.log

# View last 50 lines
tail -50 dashboard.log
```

### Reset Dashboard
```bash
# Stop the dashboard
./stop-dashboard.sh

# Clear logs and cache
rm -f dashboard.log dashboard.pid
rm -rf .next

# Install fresh dependencies
npm install

# Start dashboard
./start-dashboard.sh
```

## Process Information

- **Process ID**: Saved in `dashboard.pid`
- **Log File**: `dashboard.log`
- **Port**: 3000
- **Environment**: Development
- **Auto-reload**: Enabled (changes to code automatically reload)

## Manual Commands

If you prefer manual control:

```bash
# Start in foreground (with live logs)
npm run dev

# Start in background
nohup npm run dev > dashboard.log 2>&1 &

# Build for production
npm run build
npm start
```

## Current Status

As of the last check:
- ✅ Dashboard is RUNNING (PID stored in dashboard.pid)
- ✅ Port 3000 is active
- ✅ API endpoint is responding
- ✅ 68 profiles loaded in webhook data

## Notes

- The dashboard runs persistently in the background
- It will continue running even if you close the terminal
- Logs are continuously written to `dashboard.log`
- The dashboard automatically restarts on code changes
- All webhook data is simulated for demo purposes