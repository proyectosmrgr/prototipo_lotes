// pagos.jsx — Tabla de pagos + Comprobante + Registro

function Pagos({ db, setDB, onOpenSocio, toast }) {
  const [search, setSearch] = React.useState('');
  const [filtroEstado, setFiltroEstado] = React.useState('Todos');
  const [filtroConcepto, setFiltroConcepto] = React.useState('Todos');
  const [page, setPage] = React.useState(1);
  const pageSize = 15;
  const [comprobanteId, setComprobanteId] = React.useState(null);
  const [newModal, setNewModal] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = db.pagos;
    if (q) {
      arr = arr.filter(p => {
        const socio = db.socios.find(s => s.id === p.socio_id);
        return p.comprobante.includes(q) ||
          p.concepto.toLowerCase().includes(q) ||
          (socio && (socio.nombre_completo.toLowerCase().includes(q) || socio.dni.includes(q) || socio.codigo.toLowerCase().includes(q)));
      });
    }
    if (filtroEstado !== 'Todos') arr = arr.filter(p => p.estado === filtroEstado);
    if (filtroConcepto !== 'Todos') arr = arr.filter(p => p.concepto_id === filtroConcepto);
    return arr;
  }, [db.pagos, db.socios, search, filtroEstado, filtroConcepto]);

  React.useEffect(() => { setPage(1); }, [search, filtroEstado, filtroConcepto]);

  const totales = React.useMemo(() => {
    const t = { pagado: 0, pendiente: 0, vencido: 0, count: filtered.length };
    filtered.forEach(p => {
      if (p.estado === 'Pagado') t.pagado += p.monto;
      else if (p.estado === 'Pendiente') t.pendiente += p.monto;
      else if (p.estado === 'Vencido') t.vencido += p.monto;
    });
    return t;
  }, [filtered]);

  const pagedRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const comp = comprobanteId ? db.pagos.find(p => p.id === comprobanteId) : null;
  const compSocio = comp ? db.socios.find(s => s.id === comp.socio_id) : null;

  const marcarPagado = (p) => {
    setDB({
      ...db, pagos: db.pagos.map(x => x.id === p.id ? {
        ...x, estado: 'Pagado',
        fecha_pago: new Date().toISOString().slice(0, 10),
        metodo: x.metodo === '—' ? 'Yape' : x.metodo,
      } : x)
    });
    toast(`Pago ${p.comprobante} registrado como pagado`);
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="section-eyebrow left">Cobranza</div>
          <h1 className="page-title">Pagos <em>administrativos</em></h1>
          <div className="page-subtitle">Cuotas mensuales, mantenimiento, extraordinarias y penalidades. Vencimiento día 15 de cada mes.</div>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={<Icon.download />}>Reporte mensual</Button>
          <Button variant="primary" icon={<Icon.plus />} onClick={() => setNewModal(true)}>Registrar pago</Button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <KPIMini label="Cobrado (filtrado)" value={fmtSoles(totales.pagado)} icon={<Icon.creditcard />} tone="green" />
        <KPIMini label="Por cobrar" value={fmtSoles(totales.pendiente)} icon={<Icon.alert />} tone="amber" />
        <KPIMini label="Vencido" value={fmtSoles(totales.vencido)} icon={<Icon.alert />} tone="red" />
        <KPIMini label="Comprobantes" value={fmtNum(totales.count)} icon={<Icon.report />} tone="blue" />
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search-box">
            <Icon.search />
            <input placeholder="Buscar comprobante, socio, DNI…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="row" style={{ gap: 6 }}>
            {['Todos', 'Pagado', 'Pendiente', 'Vencido'].map(e => (
              <button key={e} className={`chip ${filtroEstado === e ? 'active' : ''}`} onClick={() => setFiltroEstado(e)}>{e}</button>
            ))}
          </div>
          <div className="table-toolbar-right">
            <select className="select" style={{ width: 'auto', minWidth: 180 }} value={filtroConcepto} onChange={(e) => setFiltroConcepto(e.target.value)}>
              <option value="Todos">Todos los conceptos</option>
              {CONCEPTOS_PAGO.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th>Comprobante</th>
              <th>Socio</th>
              <th>Concepto</th>
              <th>Periodo</th>
              <th>Vencimiento</th>
              <th>Método</th>
              <th>Estado</th>
              <th className="cell-num">Monto</th>
              <th className="cell-actions"></th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 && (
              <tr><td colSpan={9}><div className="empty"><div className="empty-title">Sin resultados</div><div>No hay pagos con esos filtros.</div></div></td></tr>
            )}
            {pagedRows.map(p => {
              const socio = db.socios.find(s => s.id === p.socio_id);
              return (
                <tr key={p.id} className="clickable" onClick={() => setComprobanteId(p.id)}>
                  <td><span className="cell-mono">{p.comprobante}</span></td>
                  <td>
                    <div className="row-avatar">
                      <div className="av">{iniciales(socio?.nombre_completo || '?')}</div>
                      <div>
                        <div className="cell-strong">{socio?.nombre_completo}</div>
                        <div className="cell-muted" style={{ fontSize: 11 }}>{socio?.codigo}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.concepto}</td>
                  <td>{p.periodo}</td>
                  <td>{fmtFecha(p.fecha_vencimiento)}</td>
                  <td className="cell-muted">{p.metodo}</td>
                  <td><StatusBadge value={p.estado} /></td>
                  <td className="cell-num cell-mono cell-strong">{fmtSoles(p.monto)}</td>
                  <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                      {p.estado !== 'Pagado' && (
                        <button className="icon-btn" style={{ width: 30, height: 30, border: 'none' }} title="Marcar como pagado" onClick={() => marcarPagado(p)}><Icon.check /></button>
                      )}
                      <button className="icon-btn" style={{ width: 30, height: 30, border: 'none' }} title="Ver comprobante" onClick={() => setComprobanteId(p.id)}><Icon.eye /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />
      </div>

      {/* Comprobante modal */}
      {comp && (
        <Modal open onClose={() => setComprobanteId(null)} size="lg" title={`Comprobante ${comp.comprobante}`}
          foot={
            <>
              <Button variant="ghost" icon={<Icon.print />}>Imprimir</Button>
              <Button variant="secondary" icon={<Icon.download />}>Descargar PDF</Button>
              {comp.estado !== 'Pagado' && (
                <Button variant="primary" icon={<Icon.check />} onClick={() => { marcarPagado(comp); setComprobanteId(null); }}>Marcar pagado</Button>
              )}
            </>
          }>
          <Comprobante pago={comp} socio={compSocio} asociacion={db.asociacion} />
        </Modal>
      )}

      {newModal && (
        <PagoForm
          socios={db.socios}
          onClose={() => setNewModal(false)}
          onSave={(data) => {
            const id = Math.max(...db.pagos.map(p => p.id)) + 1;
            const concepto = CONCEPTOS_PAGO.find(c => c.id === data.concepto_id);
            const newP = {
              ...data, id,
              concepto: concepto.label,
              comprobante: `00${100000 + id}`,
            };
            setDB({ ...db, pagos: [newP, ...db.pagos] });
            toast(`Pago ${newP.comprobante} registrado`);
            setNewModal(false);
          }}
        />
      )}
    </div>
  );
}

function Comprobante({ pago, socio, asociacion }) {
  const stampClass = pago.estado === 'Pagado' ? '' : pago.estado === 'Pendiente' ? 'pendiente' : 'vencido';
  const stampText = pago.estado === 'Pagado' ? 'PAGADO' : pago.estado === 'Pendiente' ? 'PENDIENTE' : 'VENCIDO';
  return (
    <div className="comprobante">
      <div className="comprobante-stamp {stampClass}" style={{
        position: 'absolute', top: 30, right: 30, transform: 'rotate(-12deg)',
        border: `3px solid ${pago.estado === 'Pagado' ? 'var(--green)' : pago.estado === 'Pendiente' ? 'var(--amber)' : 'var(--red)'}`,
        color: pago.estado === 'Pagado' ? 'var(--green)' : pago.estado === 'Pendiente' ? 'var(--amber)' : 'var(--red)',
        fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 26,
        padding: '6px 18px', letterSpacing: '0.04em', opacity: 0.75,
      }}>
        {stampText}
      </div>
      <div className="comprobante-head">
        <div>
          <h2>{asociacion.nombre}</h2>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{asociacion.subtitulo}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>RUC 20100234567 · Av. Los Próceres 456, Pachacámac</div>
        </div>
        <div className="right">
          <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Comprobante de pago</div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>N° {pago.comprobante}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>Emitido: {fmtFecha(pago.fecha_emision)}</div>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div className="comprobante-row"><span className="lbl">Socio:</span><span>{socio?.nombre_completo}</span></div>
        <div className="comprobante-row"><span className="lbl">Código:</span><span>{socio?.codigo}</span></div>
        <div className="comprobante-row"><span className="lbl">DNI:</span><span>{socio?.dni}</span></div>
        <div className="comprobante-row"><span className="lbl">Lote:</span><span>{socio?.lote_id || '—'}</span></div>
      </div>

      <div style={{ borderTop: '1px dashed var(--ink-3)', paddingTop: 14, marginBottom: 14 }}>
        <div className="comprobante-row" style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <span>Concepto</span><span>Periodo</span><span style={{ width: 100, textAlign: 'right' }}>Monto</span>
        </div>
        <div className="comprobante-row" style={{ paddingTop: 8 }}>
          <span style={{ flex: 1 }}>{pago.concepto}</span>
          <span style={{ flex: 1, textAlign: 'center' }}>{pago.periodo}</span>
          <span style={{ width: 100, textAlign: 'right' }}>{fmtSoles(pago.monto)}</span>
        </div>
      </div>

      <div className="comprobante-total">
        Total: {fmtSoles(pago.monto)}
      </div>

      <div style={{ marginTop: 24, fontSize: 11, color: 'var(--ink-3)', borderTop: '1px dashed var(--ink-3)', paddingTop: 14 }}>
        <div className="comprobante-row"><span className="lbl">Vencimiento:</span><span>{fmtFecha(pago.fecha_vencimiento)}</span></div>
        <div className="comprobante-row"><span className="lbl">Fecha de pago:</span><span>{fmtFecha(pago.fecha_pago) || '—'}</span></div>
        <div className="comprobante-row"><span className="lbl">Método:</span><span>{pago.metodo}</span></div>
      </div>

      <div style={{ marginTop: 24, fontSize: 10, color: 'var(--ink-4)', textAlign: 'center', borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
        Documento emitido electrónicamente. Conserve este comprobante. · {asociacion.nombre} © {new Date().getFullYear()}
      </div>
    </div>
  );
}

function PagoForm({ socios, onClose, onSave }) {
  const [f, setF] = React.useState({
    socio_id: socios[0]?.id || 1,
    concepto_id: 'cuota',
    monto: 80,
    periodo: `${MESES[new Date().getMonth()]} ${new Date().getFullYear()}`,
    fecha_emision: new Date().toISOString().slice(0, 10),
    fecha_vencimiento: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    fecha_pago: new Date().toISOString().slice(0, 10),
    estado: 'Pagado',
    metodo: 'Yape',
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const setConcepto = (id) => {
    const c = CONCEPTOS_PAGO.find(x => x.id === id);
    setF(s => ({ ...s, concepto_id: id, monto: c.monto }));
  };
  const [socioSearch, setSocioSearch] = React.useState('');
  const sociosFiltrados = React.useMemo(() => {
    const q = socioSearch.trim().toLowerCase();
    if (!q) return socios.slice(0, 30);
    return socios.filter(s =>
      s.nombre_completo.toLowerCase().includes(q) || s.dni.includes(q) || s.codigo.toLowerCase().includes(q)
    ).slice(0, 30);
  }, [socios, socioSearch]);

  return (
    <Modal open onClose={onClose} size="lg" title="Registrar nuevo pago"
      foot={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => onSave(f)}>Registrar</Button>
        </>
      }>
      <div className="stack" style={{ gap: 14 }}>
        <div className="field">
          <label className="field-label">Socio</label>
          <input className="input" placeholder="Buscar por nombre, DNI o código…" value={socioSearch} onChange={(e) => setSocioSearch(e.target.value)} style={{ marginBottom: 6 }} />
          <select className="select" value={f.socio_id} onChange={(e) => set('socio_id', +e.target.value)} size="5" style={{ height: 'auto', padding: 0 }}>
            {sociosFiltrados.map(s => (
              <option key={s.id} value={s.id}>{s.codigo} — {s.nombre_completo} ({s.dni})</option>
            ))}
          </select>
        </div>
        <div className="grid grid-2" style={{ gap: 14 }}>
          <div className="field">
            <label className="field-label">Concepto</label>
            <select className="select" value={f.concepto_id} onChange={(e) => setConcepto(e.target.value)}>
              {CONCEPTOS_PAGO.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Monto (S/)</label>
            <input className="input" type="number" value={f.monto} onChange={(e) => set('monto', +e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Periodo</label>
            <input className="input" value={f.periodo} onChange={(e) => set('periodo', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Estado</label>
            <select className="select" value={f.estado} onChange={(e) => set('estado', e.target.value)}>
              <option>Pagado</option><option>Pendiente</option><option>Vencido</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label">Fecha de pago</label>
            <input className="input" type="date" value={f.fecha_pago || ''} onChange={(e) => set('fecha_pago', e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Método</label>
            <select className="select" value={f.metodo} onChange={(e) => set('metodo', e.target.value)}>
              {METODOS_PAGO.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { Pagos });
