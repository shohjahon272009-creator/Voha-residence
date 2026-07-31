// PM2 process manager konfiguratsiyasi — Voha Residence
// Ishga tushirish:  pm2 start ecosystem.config.js
// Holatni ko'rish:  pm2 status
// Loglar:           pm2 logs voha
// Qayta ishga:      pm2 restart voha
// Server o'chib-yonganda avto-ishga tushirish:  pm2 startup && pm2 save

module.exports = {
  apps: [
    {
      name: 'voha',
      cwd: '/var/www/qurilish',        // <-- serverdagi loyiha papkasi (DEPLOY.md bilan bir xil)
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        // AUTH_SECRET ni shu yerga EMAS, .env fayliga yozing (xavfsizroq)
      },
    },
  ],
};
