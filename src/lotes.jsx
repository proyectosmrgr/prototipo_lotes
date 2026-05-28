// lotes.jsx — Tabla + Vista mapa (plano de manzanas)

function Lotes({ db, setDB, onOpenSocio, toast }) {
  const [view, setView] = React.useState('mapa'); // mapa | tabla | cards
  const [search, setSearch] = React.useState('');
  const [filtroEstado, setFiltroEstado] = React.useState('Todos');
  const [filtroManzana, setFiltroManzana] = React.useState('Todas');
  const [selectedLote, setSelectedLote] = React.useState(null);
  const [modal, setModal] = React.useState(null); // 'new' | { lote }

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = db.lotes;
    if (q) arr = arr.filter(l => l.codigo.toLowerCase().includes(q) || l.id.toLowerCase().includes(q));
    if (filtroEstado !== 'Todos') arr = arr.filter(l => l.estado === filtroEstado);
    if (filtroManzana !== 'Todas') arr = arr.filter(l => l.manzana === filtroManzana);
    return arr;
  }, [db.lotes, search, filtroEstado, filtroManzana]);

  const counts = React.useMemo(() => {
    const c = { Ocupado: 0, Disponible: 0, Reservado: 0, Moroso: 0 };
    db.lotes.forEach(l => { c[l.estado] = (c[l.estado] || 0) + 1; });
    return c;
  }, [db.lotes]);

  const sel = selectedLote ? db.lotes.find(l => l.id === selectedLote) : null;
  const selSocio = sel?.socio_id ? db.socios.find(s => s.id === sel.socio_id) : null;

  const cambiarEstado = (lote, nuevoEstado) => {
    setDB({ ...db, lotes: db.lotes.map(l => l.id === lote.id ? { ...l, estado: nuevoEstado } : l) });
    toast(`Lote ${lote.codigo} → ${nuevoEstado}`);
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="section-eyebrow left">Gestión</div>
          <h1 className="page-title">Plano de <em>lotes</em></h1>
          <div className="page-subtitle">{MANZANAS.length} manzanas · {db.lotes.length} lotes totales. Ocupación al {Math.round(((counts.Ocupado + counts.Moroso) / db.lotes.length) * 100)}%.</div>
        </div>
        <div className="page-actions">
          <div className="row" style={{ gap: 2, border: '1px solid var(--line)', borderRadius: 8, padding: 2, background: 'var(--surface)' }}>
            {['mapa', 'tabla', 'cards'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '6px 12px', fontSize: 12, border: 'none', cursor: 'pointer',
                background: view === v ? 'var(--ink)' : 'transparent',
                color: view === v ? 'var(--surface)' : 'var(--ink-2)',
                borderRadius: 6, textTransform: 'capitalize', fontWeight: 500,
              }}>{v}</button>
            ))}
          </div>
          <Button variant="primary" icon={<Icon.plus />} onClick={() => setModal('new')}>Nuevo lote</Button>
        </div>
      </div>

      {/* Counts summary */}
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <CountCard label="Ocupados" value={counts.Ocupado} color="var(--green)" />
        <CountCard label="Disponibles" value={counts.Disponible} color="var(--blue)" />
        <CountCard label="Reservados" value={counts.Reservado} color="var(--amber)" />
        <CountCard label="Morosos" value={counts.Moroso} color="var(--red)" />
      </div>

      {/* Filters */}
      <div className="row" style={{ gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div className="search-box" style={{ width: 280 }}>
          <Icon.search />
          <input placeholder="Buscar lote por código…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="row" style={{ gap: 6 }}>
          {['Todos', 'Ocupado', 'Disponible', 'Reservado', 'Moroso'].map(e => (
            <button key={e} className={`chip ${filtroEstado === e ? 'active' : ''}`} onClick={() => setFiltroEstado(e)}>{e}</button>
          ))}
        </div>
        <select className="select" style={{ width: 'auto', minWidth: 140, marginLeft: 'auto' }} value={filtroManzana} onChange={(e) => setFiltroManzana(e.target.value)}>
          <option value="Todas">Todas las manzanas</option>
          {MANZANAS.map(m => <option key={m} value={m}>Manzana {m}</option>)}
        </select>
      </div>

      {view === 'mapa' && (
        <LoteMapa db={db} filtered={filtered} onSelect={setSelectedLote} selectedLote={selectedLote} filtroManzana={filtroManzana} />
      )}

      {view === 'tabla' && (
        <LoteTabla lotes={filtered} db={db} onSelect={(id) => setSelectedLote(id)} onEdit={(l) => setModal({ lote: l })} />
      )}

      {view === 'cards' && (
        <LoteCards lotes={filtered.slice(0, 36)} db={db} onSelect={setSelectedLote} />
      )}

      {/* Drawer */}
      {sel && (
        <LoteDrawer
          lote={sel} socio={selSocio} db={db}
          onClose={() => setSelectedLote(null)}
          onOpenSocio={onOpenSocio}
          onChangeEstado={(s) => cambiarEstado(sel, s)}
        />
      )}

      {modal && (
        <LoteForm
          lote={modal === 'new' ? null : modal.lote}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal === 'new') {
              const id = `L${data.manzana}${String(data.numero).padStart(2, '0')}`;
              if (db.lotes.find(l => l.id === id)) {
                toast(`Ya existe ${id}`, 'error'); return;
              }
              const newL = { ...data, id, codigo: `MZ-${data.manzana} L-${String(data.numero).padStart(2, '0')}`, socio_id: null };
              setDB({ ...db, lotes: [...db.lotes, newL] });
              toast(`Lote ${id} creado`);
            } else {
              setDB({ ...db, lotes: db.lotes.map(l => l.id === modal.lote.id ? { ...l, ...data } : l) });
              toast(`Lote actualizado`);
            }
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function CountCard({ label, value, color }) {
  return (
    <div className="kpi" style={{ padding: '18px 20px' }}>
      <div className="row-spread" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="kpi-label">{label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1, marginTop: 8 }}>{value}</div>
        </div>
        <div style={{ width: 12, height: 12, borderRadius: 3, background: color }}></div>
      </div>
    </div>
  );
}

// —— Vista plano —— 
function LoteMapa({ db, filtered, onSelect, selectedLote, filtroManzana }) {
  const visibleIds = new Set(filtered.map(l => l.id));
  // Layout de manzanas: 4 columnas en desktop, distribuidas en grid
  const manzanasMostrar = filtroManzana !== 'Todas' ? [filtroManzana] : MANZANAS;

  return (
    <div className="card-flat" style={{ padding: 20 }}>
      <div className="row-spread" style={{ marginBottom: 16 }}>
        <div className="map-legend">
          <LegendItem color="var(--green)" bg="var(--green-soft)" label="Ocupado" />
          <LegendItem color="var(--blue)" bg="var(--surface)" border="var(--line)" label="Disponible" />
          <LegendItem color="var(--amber)" bg="var(--amber-soft)" label="Reservado" />
          <LegendItem color="var(--red)" bg="var(--red-soft)" label="Moroso" />
          <LegendItem color="var(--ink-3)" bg="repeating-linear-gradient(45deg, var(--line-soft), var(--line-soft) 4px, transparent 4px, transparent 8px)" border="var(--ink-4)" label="Área común" />
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
          ESCALA · 1:500
        </div>
      </div>

      <div className="lote-map" style={{ minHeight: filtroManzana !== 'Todas' ? 380 : 720 }}>
        {/* Título plano */}
        <div style={{
          position: 'absolute', top: 12, left: 16,
          fontFamily: 'var(--font-display)', fontStyle: 'italic',
          fontSize: 18, color: 'var(--ink-3)',
        }}>
          Plano general · {db.asociacion.nombre}
        </div>

        {/* Calles label */}
        <div style={{
          position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
          fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-4)', fontFamily: 'var(--font-mono)',
        }}>
          ━━━━━ AV. PRINCIPAL ━━━━━
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: filtroManzana !== 'Todas' ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 36,
          marginTop: 40,
          maxWidth: 1400,
        }}>
          {manzanasMostrar.map(mz => {
            const lotes = db.lotes.filter(l => l.manzana === mz);
            return (
              <div key={mz} className="lote-block">
                <div className="lote-block-label">Manzana {mz}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 6 }}>
                  {lotes.map(l => {
                    const dim = visibleIds.size === db.lotes.length || visibleIds.has(l.id) ? 1 : 0.18;
                    return (
                      <div
                        key={l.id}
                        className={`lote-cell ${l.estado.toLowerCase()} ${selectedLote === l.id ? 'selected' : ''}`}
                        style={{ opacity: dim }}
                        onClick={() => onSelect(l.id)}
                        title={l.codigo}
                      >
                        <div style={{ fontWeight: 600, fontSize: 11 }}>{l.numero}</div>
                        <div style={{ fontSize: 8 }}>{l.tamano}m²</div>
                      </div>
                    );
                  })}
                  {mz === 'D' && (
                    <div className="lote-cell area" style={{ gridColumn: 'span 2' }}>Parque</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, bg, border, label }) {
  return (
    <span className="map-legend-item">
      <span className="map-legend-swatch" style={{ background: bg, borderColor: border || color }}></span>
      {label}
    </span>
  );
}

// —— Vista tabla —— 
function LoteTabla({ lotes, db, onSelect, onEdit }) {
  return (
    <div className="table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Código</th><th>Manzana</th><th>Lote</th><th>Tamaño</th>
            <th>Propietario</th><th>Estado</th><th className="cell-num">Valor</th><th></th>
          </tr>
        </thead>
        <tbody>
          {lotes.slice(0, 50).map(l => {
            const socio = l.socio_id ? db.socios.find(s => s.id === l.socio_id) : null;
            return (
              <tr key={l.id} className="clickable" onClick={() => onSelect(l.id)}>
                <td><span className="cell-mono">{l.codigo}</span></td>
                <td><b>{l.manzana}</b></td>
                <td>{l.numero}</td>
                <td className="cell-mono">{l.tamano} m²</td>
                <td>{socio ? socio.nombre_completo : <span className="cell-muted">Sin asignar</span>}</td>
                <td><StatusBadge value={l.estado} /></td>
                <td className="cell-num cell-mono">{fmtSoles(l.precio)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <button className="icon-btn" style={{ width: 30, height: 30, border: 'none' }} onClick={() => onEdit(l)}><Icon.edit /></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {lotes.length > 50 && (
        <div className="pagination" style={{ justifyContent: 'center' }}>Mostrando 50 de {lotes.length} lotes — use filtros para acotar.</div>
      )}
    </div>
  );
}

function LoteCards({ lotes, db, onSelect }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
      {lotes.map(l => {
        const socio = l.socio_id ? db.socios.find(s => s.id === l.socio_id) : null;
        return (
          <div key={l.id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => onSelect(l.id)}>
            <div className="row-spread" style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontStyle: 'italic' }}>{l.codigo}</div>
              <StatusBadge value={l.estado} />
            </div>
            <div className="cell-muted" style={{ fontSize: 12, marginBottom: 8 }}>{l.tamano} m² · {fmtSoles(l.precio)}</div>
            <div style={{ fontSize: 12, color: socio ? 'var(--ink)' : 'var(--ink-3)' }}>
              {socio ? socio.nombre_completo : 'Sin asignar'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// —— Drawer detalles ——
function LoteDrawer({ lote, socio, db, onClose, onOpenSocio, onChangeEstado }) {
  const ingresoTotal = socio ? db.pagos.filter(p => p.socio_id === socio.id && p.estado === 'Pagado').reduce((s, p) => s + p.monto, 0) : 0;
  return (
    <>
      <div className="modal-bg" onClick={onClose} style={{ background: 'rgba(0,0,0,0.2)' }}></div>
      <aside className="drawer">
        <div style={{ padding: 24 }}>
          <div className="row-spread" style={{ marginBottom: 18 }}>
            <div className="section-eyebrow left">Lote seleccionado</div>
            <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={onClose}><Icon.close /></button>
          </div>

          <div className="row" style={{ gap: 16, marginBottom: 24 }}>
            <div style={{ width: 84, height: 84, borderRadius: 8, background: 'var(--primary)', color: '#fbf8f1', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 42, fontStyle: 'italic', lineHeight: 1 }}>
              {lote.numero}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1 }}>{lote.codigo}</div>
              <div style={{ marginTop: 6 }}><StatusBadge value={lote.estado} /></div>
              <div className="cell-muted" style={{ fontSize: 12, marginTop: 6 }}>Manzana {lote.manzana} · Lote #{lote.numero}</div>
            </div>
          </div>

          <div className="grid grid-2" style={{ gap: 14, marginBottom: 24 }}>
            <DataRow label="Tamaño" value={`${lote.tamano} m²`} mono />
            <DataRow label="Valor estimado" value={fmtSoles(lote.precio)} mono />
          </div>

          <div className="divider"></div>

          <div className="card-eyebrow" style={{ marginBottom: 12 }}>Propietario</div>
          {socio ? (
            <div className="row" style={{ gap: 12, padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 8, cursor: 'pointer' }} onClick={() => onOpenSocio(socio.id)}>
              <div className="av" style={{ width: 38, height: 38, fontSize: 14 }}>{iniciales(socio.nombre_completo)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{socio.nombre_completo}</div>
                <div className="cell-muted" style={{ fontSize: 11.5 }}>{socio.codigo} · {socio.telefono}</div>
              </div>
              <Icon.arrowright />
            </div>
          ) : (
            <p className="muted" style={{ fontSize: 13 }}>Lote sin propietario asignado.</p>
          )}

          {socio && (
            <>
              <div className="divider"></div>
              <div className="card-eyebrow" style={{ marginBottom: 12 }}>Cobranza histórica</div>
              <DataRow label="Total pagado" value={fmtSoles(ingresoTotal)} mono />
            </>
          )}

          <div className="divider"></div>

          <div className="card-eyebrow" style={{ marginBottom: 12 }}>Acciones</div>
          <div className="stack">
            <select className="select" value={lote.estado} onChange={(e) => onChangeEstado(e.target.value)}>
              <option>Ocupado</option><option>Disponible</option><option>Reservado</option><option>Moroso</option>
            </select>
            <Button variant="secondary" icon={<Icon.users />}>Reasignar propietario</Button>
            <Button variant="ghost" icon={<Icon.print />}>Imprimir ficha</Button>
          </div>
        </div>
      </aside>
    </>
  );
}

// —— Form crear/editar lote ——
function LoteForm({ lote, onClose, onSave }) {
  const [f, setF] = React.useState({
    manzana: lote?.manzana || 'A',
    numero: lote?.numero || 1,
    tamano: lote?.tamano || 150,
    estado: lote?.estado || 'Disponible',
    precio: lote?.precio || 50000,
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  return (
    <Modal open onClose={onClose} title={lote ? `Editar ${lote.codigo}` : 'Nuevo lote'}
      foot={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={() => onSave(f)}>{lote ? 'Guardar' : 'Crear lote'}</Button>
        </>
      }>
      <div className="grid grid-2" style={{ gap: 14 }}>
        <div className="field">
          <label className="field-label">Manzana</label>
          <select className="select" value={f.manzana} onChange={(e) => set('manzana', e.target.value)} disabled={!!lote}>
            {MANZANAS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Número de lote</label>
          <input className="input" type="number" value={f.numero} onChange={(e) => set('numero', +e.target.value)} disabled={!!lote} />
        </div>
        <div className="field">
          <label className="field-label">Tamaño (m²)</label>
          <input className="input" type="number" value={f.tamano} onChange={(e) => set('tamano', +e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Valor estimado (S/)</label>
          <input className="input" type="number" value={f.precio} onChange={(e) => set('precio', +e.target.value)} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Estado</label>
          <select className="select" value={f.estado} onChange={(e) => set('estado', e.target.value)}>
            <option>Disponible</option><option>Ocupado</option><option>Reservado</option><option>Moroso</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { Lotes });
