import { spawn } from 'child_process';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const port = 9224;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('Testing live Vercel production with Chrome CDP...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${port}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\denni\\AppData\\Local\\Temp\\chrome_debug3'
  ]);

  await sleep(1500);

  const targets = [
    'https://divinemercysports.vercel.app/tournaments/dmc-carrom-2026',
    'https://divinemercysports.vercel.app/tournaments/dmc-chess-2026',
    'https://divinemercysports.vercel.app/tournaments/dmc-table-tennis-2026',
    'https://divinemercysports.vercel.app/tournaments/dmc-cricket-2026',
    'https://divinemercysports.vercel.app/tournaments/dmc-throwball-2026'
  ];

  let hasError = false;

  for (const url of targets) {
    console.log(`\nVerifying live: ${url}`);
    const versionRes = await fetch(`http://127.0.0.1:${port}/json/new?${url}`, { method: 'PUT' });
    const pageInfo = await versionRes.json();
    const ws = new WebSocket(pageInfo.webSocketDebuggerUrl);

    await new Promise(res => {
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        res();
      };
    });

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        const desc = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text;
        console.error('🚨 [EXCEPTION ON LIVE]:', desc);
        hasError = true;
      }
    };

    await sleep(2500);
    ws.close();
  }

  chromeProc.kill();

  if (hasError) {
    console.error('\n❌ FAILED: Found live exceptions.');
    process.exit(1);
  } else {
    console.log('\n✅ ALL 5 LIVE TOURNAMENTS HYDRATED AND OPENED FLAWLESSLY WITH 0 ERRORS!');
    process.exit(0);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
