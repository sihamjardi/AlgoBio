export async function saveSequence(name, sequence) {
  const res = await fetch("http://localhost:8088/api/sequences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, sequence })
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
