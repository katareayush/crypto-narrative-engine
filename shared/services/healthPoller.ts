import cron from 'node-cron';
import fetch from 'node-fetch';

let healthPollerStatus = {
  lastRun: null as Date | null,
  status: 'idle' as 'idle' | 'running' | 'error',
  lastHealthCheck: null as { status: string; timestamp: Date } | null
};

const HEALTH_URL = 'https://crypto-narrative-engine.onrender.com/health';

async function runHealthCheck() {
  if (healthPollerStatus.status === 'running') return;
  
  healthPollerStatus.status = 'running';
  
  try {
    const response = await fetch(HEALTH_URL, {
      method: 'GET'
    });
    
    if (response.ok) {
      const healthData = await response.json() as any;
      healthPollerStatus.lastHealthCheck = {
        status: healthData.status || 'ok',
        timestamp: new Date()
      };
      console.log(`[Health Poller] Health check passed: ${JSON.stringify(healthData)}`);
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    healthPollerStatus.status = 'idle';
    healthPollerStatus.lastRun = new Date();
  } catch (error) {
    console.error('[Health Poller] Health check failed:', error);
    healthPollerStatus.lastHealthCheck = {
      status: 'error',
      timestamp: new Date()
    };
    healthPollerStatus.status = 'error';
  }
}

export function startHealthPoller() {
  cron.schedule('*/10 * * * *', runHealthCheck);
  
  setTimeout(() => {
    runHealthCheck().catch(console.error);
  }, 5000);
  
  console.log('[Health Poller] Started - polling every 10 minutes');
}

export function getHealthPollerStatus() {
  return healthPollerStatus;
}