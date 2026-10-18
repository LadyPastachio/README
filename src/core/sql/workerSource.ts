/**
 * Code that runs inside the SQL worker. Each query gets a brand-new
 * database built from the exercise's setup script, so nothing a learner
 * runs can change the practice data, and results are always repeatable.
 */
export const WORKER_HANDLER = `
let SQL = null;
self.onmessage = async (event) => {
  const msg = event.data;
  try {
    if (msg.type === 'init') {
      SQL = await initSqlJs({ wasmBinary: msg.wasm });
      self.postMessage({ type: 'ready' });
      return;
    }
    if (msg.type === 'run') {
      const db = new SQL.Database();
      try {
        if (msg.setup) db.exec(msg.setup);
        const results = db.exec(msg.query);
        self.postMessage({ type: 'result', id: msg.id, ok: true, results });
      } finally {
        db.close();
      }
    }
  } catch (e) {
    self.postMessage({ type: 'result', id: msg.id, ok: false, error: String(e && e.message ? e.message : e) });
  }
};
`;
