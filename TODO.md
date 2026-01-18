# TODO: Fix Post-Deployment Issues

## Completed Tasks
- [x] Update database schema: Change vitals.value from REAL to TEXT
- [x] Update frontend Vitals.js: Change value input from type="number" to type="text"
- [x] Update multer config: Use /data/uploads in production for persistent storage on Render
- [x] Update server.js: Ensure /data/uploads and /data/database directories exist in production

## Pending Tasks
- [ ] Set REACT_APP_BACKEND_URL in Vercel to Render backend URL (https://digital-health-wallet-wr5m.onrender.com)
- [ ] Test the fixes locally
- [ ] Redeploy backend to Render
- [ ] Redeploy frontend to Vercel
- [ ] Test deployed application
