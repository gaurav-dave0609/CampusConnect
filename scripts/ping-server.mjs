async function check() {
  try {
    const res = await fetch('http://localhost:3000');
    console.log('SERVER IS UP! Status:', res.status);
  } catch (err) {
    console.error('SERVER NOT READY YET:', err.message);
  }
}
check();
