const url = 'https://unicorn19.netlify.app/.netlify/functions/items';

async function run() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-token': process.env.API_TOKEN
    },
    body: JSON.stringify({ name: 'added by GitHub Action' })
  });
  console.log('Status:', res.status);
  console.log(await res.text());
  if (!res.ok) process.exit(1);
}

run();
