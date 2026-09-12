const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SOCKET = '/home/prathamesh/hospital/data/mysql.sock';
const DATADIR = '/home/prathamesh/hospital/data/mysql';
const PIDFILE = '/home/prathamesh/hospital/data/mysql.pid';
const LOGFILE = '/home/prathamesh/hospital/data/error.log';

function isMySQLAlive() {
  try {
    execSync(`mysqladmin -u root --socket="${SOCKET}" ping`, { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

function ensureDB() {
  if (isMySQLAlive()) {
    console.log('✅ MySQL Server is already active.');
    return;
  }

  console.log('🔄 MySQL is not running. Starting MySQL server...');

  try {
    if (fs.existsSync(SOCKET)) fs.unlinkSync(SOCKET);
    if (fs.existsSync(`${SOCKET}.lock`)) fs.unlinkSync(`${SOCKET}.lock`);
    if (fs.existsSync(PIDFILE)) fs.unlinkSync(PIDFILE);
  } catch (e) {
    // Ignore cleanup errors
  }

  const child = spawn(
    '/usr/sbin/mysqld',
    [
      `--datadir=${DATADIR}`,
      `--socket=${SOCKET}`,
      '--port=3307',
      `--pid-file=${PIDFILE}`,
      `--log-error=${LOGFILE}`,
      '--mysqlx=0',
    ],
    {
      detached: true,
      stdio: 'ignore',
    }
  );

  child.unref();

  // Wait up to 15 seconds for MySQL to be ready
  const start = Date.now();
  while (Date.now() - start < 15000) {
    if (isMySQLAlive()) {
      console.log('✅ MySQL Server started successfully.');
      return;
    }
    try {
      execSync('sleep 0.5');
    } catch (_) {}
  }

  console.error('❌ Failed to start MySQL within 15 seconds. Check ' + LOGFILE);
  process.exit(1);
}

ensureDB();
