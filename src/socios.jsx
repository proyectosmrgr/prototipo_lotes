// socios.jsx — Lista de socios + Perfil + CRUD

function Socios({ db, setDB, onOpenSocio, toast, globalSearch }) {
  const [search, setSearch] = React.useState('');
  const [filtroEstado, setFiltroEstado] = React.useState('Todos');
  const [filtroDistrito, setFiltroDistrito] = React.useState('Todos');
  const [page, setPage] = React.useState(1);
  const pageSize = 12;
  const [sortKey, setSortKey] = React.useState('codigo');
  const [sortDir, setSortDir] = React.useState('asc');
  const [modal, setModal] = React.useState(null); // { mode: 'new'|'edit', socio }
  const [confirmDelete, setConfirmDelete] = React.useState(null);

  // —— Sync global search if it matches a socio-ish query ——
  React.useEffect(() => {
    if (globalSearch) setSearch(globalSearch);
  }, [globalSearch]);

  const distritos = React.useMemo(() => Array.from(new Set(db.socios.map(s => s.distrito))).sort(), [db.socios]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = db.socios;
    if (q) {
      arr = arr.filter(s =>
        s.nombre_completo.toLowerCase().includes(q) ||
        s.dni.includes(q) ||
        s.codigo.toLowerCase().includes(q) ||
        (s.lote_id || '').toLowerCase().includes(q) ||
        s.telefono.includes(q)
      );
    }
    if (filtroEstado !== 'Todos') arr = arr.filter(s => s.estado === filtroEstado);
    if (filtroDistrito !== 'Todos') arr = arr.filter(s => s.distrito === filtroDistrito);
    arr = [...arr].sort((a, b) => {
      const av = a[sortKey] || '', bv = b[sortKey] || '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [db.socios, search, filtroEstado, filtroDistrito, sortKey, sortDir]);

  const pagedRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  React.useEffect(() => { setPage(1); }, [search, filtroEstado, filtroDistrito]);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(k); setSortDir('asc'); }
  };

  const handleSave = (data) => {
    if (modal.mode === 'new') {
      const id = Math.max(...db.socios.map(s => s.id)) + 1;
      const newS = {
        ...data, id, codigo: `SOC-${String(id).padStart(4, '0')}`,
        nombre_completo: `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}`,
        fecha_ingreso: new Date().toISOString().slice(0, 10),
        lote_id: null, genero: data.genero || 'M',
      };
      setDB({ ...db, socios: [newS, ...db.socios] });
      toast(`Socio ${newS.nombre_completo} creado`);
    } else {
      const updated = { ...modal.socio, ...data, nombre_completo: `${data.nombres} ${data.apellido_paterno} ${data.apellido_materno}` };
      setDB({ ...db, socios: db.socios.map(s => s.id === updated.id ? updated : s) });
      toast(`Datos de ${updated.nombre_completo} actualizados`);
    }
    setModal(null);
  };

  const handleDelete = () => {
    const s = confirmDelete;
    setDB({ ...db, socios: db.socios.filter(x => x.id !== s.id) });
    toast(`Socio ${s.nombre_completo} eliminado`, 'error');
    setConfirmDelete(null);
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="section-eyebrow left">Gestión</div>
          <h1 className="page-title">Socios <em>de la asociación</em></h1>
          <div className="page-subtitle">Directorio completo · {fmtNum(filtered.length)} de {fmtNum(db.socios.length)} resultados visibles.</div>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={<Icon.download />}>Exportar CSV</Button>
          <Button variant="primary" icon={<Icon.plus />} onClick={() => setModal({ mode: 'new', socio: {} })}>Nuevo socio</Button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="search-box">
            <Icon.search />
            <input placeholder="Buscar por nombre, DNI, código, lote…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="row" style={{ gap: 6 }}>
            {['Todos', 'Activo', 'Moroso', 'Suspendido'].map(e => (
              <button key={e} className={`chip ${filtroEstado === e ? 'active' : ''}`} onClick={() => setFiltroEstado(e)}>{e}</button>
            ))}
          </div>
          <div className="table-toolbar-right">
            <select className="select" style={{ width: 'auto', minWidth: 160 }} value={filtroDistrito} onChange={(e) => setFiltroDistrito(e.target.value)}>
              <option value="Todos">Todos los distritos</option>
              {distritos.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <ThSort label="Código" k="codigo" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th>Socio</th>
              <ThSort label="DNI" k="dni" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th>Teléfono</th>
              <th>Lote</th>
              <th>Estado</th>
              <ThSort label="Ingreso" k="fecha_ingreso" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
              <th className="cell-actions"></th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 && (
              <tr><td colSpan={8}>
                <div className="empty">
                  <div className="empty-title">Sin resultados</div>
                  <div>No encontramos socios con esos filtros.</div>
                </div>
              </td></tr>
            )}
            {pagedRows.map((s) => (
              <tr key={s.id} className="clickable" onClick={() => onOpenSocio(s.id)}>
                <td><span className="cell-mono">{s.codigo}</span></td>
                <td>
                  <div className="row-avatar">
                    <div className="av">{iniciales(s.nombre_completo)}</div>
                    <div>
                      <div className="cell-strong">{s.nombre_completo}</div>
                      <div className="cell-muted" style={{ fontSize: 11.5 }}>{s.ocupacion} · {s.distrito}</div>
                    </div>
                  </div>
                </td>
                <td><span className="cell-mono">{s.dni}</span></td>
                <td><span className="cell-mono">{s.telefono}</span></td>
                <td>{s.lote_id ? <span className="cell-mono">{s.lote_id}</span> : <span className="cell-muted">—</span>}</td>
                <td><StatusBadge value={s.estado} /></td>
                <td>{fmtFecha(s.fecha_ingreso)}</td>
                <td className="cell-actions" onClick={(e) => e.stopPropagation()}>
                  <div className="row" style={{ justifyContent: 'flex-end', gap: 4 }}>
                    <button className="icon-btn" style={{ width: 30, height: 30, border: 'none' }} onClick={() => setModal({ mode: 'edit', socio: s })}><Icon.edit /></button>
                    <button className="icon-btn" style={{ width: 30, height: 30, border: 'none' }} onClick={() => setConfirmDelete(s)}><Icon.trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination page={page} pageSize={pageSize} total={filtered.length} onChange={setPage} />
      </div>

      {/* Modal nuevo/editar */}
      {modal && (
        <SocioForm
          mode={modal.mode}
          socio={modal.socio}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <Modal open onClose={() => setConfirmDelete(null)} title="Eliminar socio"
          foot={
            <>
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancelar</Button>
              <Button variant="danger" onClick={handleDelete}>Sí, eliminar</Button>
            </>
          }>
          <p>¿Confirma eliminar a <b>{confirmDelete.nombre_completo}</b>? Esta acción no se puede deshacer y removerá su historial de pagos asociado.</p>
        </Modal>
      )}
    </div>
  );
}

function ThSort({ label, k, sortKey, sortDir, onSort }) {
  return (
    <th className="sortable" onClick={() => onSort(k)}>
      <span className="row" style={{ gap: 4 }}>{label}
        {sortKey === k && (sortDir === 'asc' ? <span style={{ fontSize: 9 }}>▲</span> : <span style={{ fontSize: 9 }}>▼</span>)}
      </span>
    </th>
  );
}

function SocioForm({ mode, socio, onClose, onSave }) {
  const [f, setF] = React.useState({
    dni: socio.dni || '',
    nombres: socio.nombres || '',
    apellido_paterno: socio.apellido_paterno || '',
    apellido_materno: socio.apellido_materno || '',
    telefono: socio.telefono || '',
    email: socio.email || '',
    direccion: socio.direccion || '',
    distrito: socio.distrito || 'Pachacámac',
    ocupacion: socio.ocupacion || 'Comerciante',
    estado: socio.estado || 'Activo',
    genero: socio.genero || 'M',
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const submit = () => {
    if (!f.dni || !f.nombres || !f.apellido_paterno) return;
    onSave(f);
  };

  return (
    <Modal open onClose={onClose} size="lg" title={mode === 'new' ? 'Nuevo socio' : `Editar — ${socio.nombre_completo}`}
      foot={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={submit}>{mode === 'new' ? 'Crear socio' : 'Guardar cambios'}</Button>
        </>
      }>
      <div className="grid grid-2" style={{ gap: 14 }}>
        <div className="field">
          <label className="field-label">DNI</label>
          <input className="input" value={f.dni} maxLength={8} onChange={(e) => set('dni', e.target.value.replace(/\D/g, ''))} placeholder="71234567" />
        </div>
        <div className="field">
          <label className="field-label">Teléfono</label>
          <input className="input" value={f.telefono} onChange={(e) => set('telefono', e.target.value)} placeholder="987654321" />
        </div>
        <div className="field">
          <label className="field-label">Nombres</label>
          <input className="input" value={f.nombres} onChange={(e) => set('nombres', e.target.value)} placeholder="María Elena" />
        </div>
        <div className="field">
          <label className="field-label">Género</label>
          <select className="select" value={f.genero} onChange={(e) => set('genero', e.target.value)}>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Apellido paterno</label>
          <input className="input" value={f.apellido_paterno} onChange={(e) => set('apellido_paterno', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Apellido materno</label>
          <input className="input" value={f.apellido_materno} onChange={(e) => set('apellido_materno', e.target.value)} />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label className="field-label">Dirección</label>
          <input className="input" value={f.direccion} onChange={(e) => set('direccion', e.target.value)} placeholder="Av. Los Próceres 234" />
        </div>
        <div className="field">
          <label className="field-label">Distrito</label>
          <select className="select" value={f.distrito} onChange={(e) => set('distrito', e.target.value)}>
            <option>Pachacámac</option><option>Lurín</option><option>Cieneguilla</option><option>Carabayllo</option><option>Puente Piedra</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Email</label>
          <input className="input" value={f.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Ocupación</label>
          <input className="input" value={f.ocupacion} onChange={(e) => set('ocupacion', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Estado</label>
          <select className="select" value={f.estado} onChange={(e) => set('estado', e.target.value)}>
            <option>Activo</option><option>Moroso</option><option>Suspendido</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// Perfil de socio
// ============================================================
function SocioDetalle({ db, socioId, onBack, onNav, setDB, toast }) {
  const socio = db.socios.find(s => s.id === socioId);
  const [tab, setTab] = React.useState('resumen');

  if (!socio) {
    return (
      <div className="empty">
        <div className="empty-title">Socio no encontrado</div>
        <Button variant="secondary" onClick={onBack}>Volver</Button>
      </div>
    );
  }

  const pagos = db.pagos.filter(p => p.socio_id === socio.id);
  const pagosOk = pagos.filter(p => p.estado === 'Pagado');
  const pagosPend = pagos.filter(p => p.estado !== 'Pagado');
  const totalPagado = pagosOk.reduce((s, p) => s + p.monto, 0);
  const deuda = pagosPend.reduce((s, p) => s + p.monto, 0);
  const lote = db.lotes.find(l => l.id === socio.lote_id);
  const cumplimiento = pagos.length > 0 ? Math.round((pagosOk.length / pagos.length) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="row" style={{ marginBottom: 18 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><Icon.chevronleft /> Volver al directorio</button>
      </div>

      <div className="profile-hero stagger" style={{ marginBottom: 24 }}>
        <div className="profile-avatar">{iniciales(socio.nombre_completo)}</div>
        <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.6, marginBottom: 6 }}>
            {socio.codigo} · {socio.ocupacion}
          </div>
          <div className="profile-name">{socio.nombre_completo}</div>
          <div className="profile-meta">
            <span className="row" style={{ gap: 6 }}><Icon.pin /> {socio.direccion}</span>
            <span className="dotsep"></span>
            <span className="row" style={{ gap: 6 }}><Icon.phone /> {socio.telefono}</span>
            <span className="dotsep"></span>
            <span className="row" style={{ gap: 6 }}><Icon.mail /> {socio.email}</span>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'right' }}>
          <StatusBadge value={socio.estado} />
          <div style={{ marginTop: 12, opacity: 0.7, fontSize: 12 }}>Socio desde {fmtFecha(socio.fecha_ingreso)}</div>
        </div>
      </div>

      <div className="grid grid-4 stagger" style={{ marginBottom: 22 }}>
        <KPIMini label="Total pagado" value={totalPagado} icon={<Icon.creditcard />} tone="green" />
        <KPIMini label="Deuda actual" value={deuda} icon={<Icon.alert />} tone={deuda > 0 ? 'red' : 'green'} />
        <KPIMini label="Cumplimiento" value={`${cumplimiento}%`} icon={<Icon.check />} tone="blue" />
        <KPIMini label="Lote asignado" value={lote ? lote.codigo : '—'} icon={<Icon.map />} tone="amber" />
      </div>

      <div className="tabs" style={{ marginBottom: 20 }}>
        {[
          { id: 'resumen', label: 'Resumen' },
          { id: 'pagos', label: `Pagos (${pagos.length})` },
          { id: 'asistencias', label: 'Asistencias' },
          { id: 'documentos', label: 'Documentos' },
        ].map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {tab === 'resumen' && (
        <div className="grid" style={{ gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-eyebrow">Datos personales</div>
            <div className="grid grid-2" style={{ gap: 16, marginTop: 14 }}>
              <DataRow label="DNI" value={socio.dni} mono />
              <DataRow label="Código" value={socio.codigo} mono />
              <DataRow label="Género" value={socio.genero === 'M' ? 'Masculino' : 'Femenino'} />
              <DataRow label="Fecha de ingreso" value={fmtFecha(socio.fecha_ingreso)} />
              <DataRow label="Distrito" value={socio.distrito} />
              <DataRow label="Ocupación" value={socio.ocupacion} />
            </div>
            <div className="divider"></div>
            <div className="card-eyebrow">Estado financiero</div>
            <div style={{ marginTop: 14 }}>
              <div className="row-spread" style={{ marginBottom: 6, fontSize: 12.5 }}>
                <span>{pagosOk.length} pagos puntuales de {pagos.length}</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{cumplimiento}%</span>
              </div>
              <div className="progress">
                <div className={`progress-bar ${cumplimiento > 85 ? 'green' : cumplimiento > 60 ? 'amber' : 'red'}`} style={{ width: `${cumplimiento}%` }}></div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-eyebrow">Lote asignado</div>
            {lote ? (
              <div style={{ marginTop: 12 }}>
                <div className="row" style={{ gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 60, height: 60, border: '2px solid var(--primary)', borderRadius: 6, background: 'var(--primary-tint)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--primary)' }}>
                    {lote.numero}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.1 }}>{lote.codigo}</div>
                    <div className="cell-muted" style={{ fontSize: 12 }}>Manzana {lote.manzana} · {lote.tamano} m²</div>
                  </div>
                </div>
                <DataRow label="Estado" value={<StatusBadge value={lote.estado} />} />
                <DataRow label="Valor estimado" value={fmtSoles(lote.precio)} mono />
                <div className="divider"></div>
                <Button variant="secondary" size="sm" onClick={() => onNav('lotes')}>Ver en plano <Icon.arrowupright /></Button>
              </div>
            ) : (
              <p className="muted" style={{ marginTop: 12 }}>Sin lote asignado.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'pagos' && (
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Comprobante</th><th>Concepto</th><th>Periodo</th><th>Vencimiento</th>
                <th>Estado</th><th className="cell-num">Monto</th>
              </tr>
            </thead>
            <tbody>
              {pagos.slice(0, 30).map(p => (
                <tr key={p.id}>
                  <td><span className="cell-mono">{p.comprobante}</span></td>
                  <td className="cell-strong">{p.concepto}</td>
                  <td>{p.periodo}</td>
                  <td>{fmtFecha(p.fecha_vencimiento)}</td>
                  <td><StatusBadge value={p.estado} /></td>
                  <td className="cell-num cell-mono">{fmtSoles(p.monto)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'asistencias' && (
        <div className="card">
          <div className="empty">
            <div className="empty-title">Módulo en desarrollo</div>
            <div>El registro de asistencias se mostrará aquí con calendario mensual y porcentaje por reunión.</div>
          </div>
        </div>
      )}

      {tab === 'documentos' && (
        <div className="grid grid-3">
          {['Constancia de socio', 'Estado de cuenta', 'Asignación de lote', 'DNI escaneado', 'Acta de incorporación'].map((d, i) => (
            <div key={i} className="card" style={{ padding: 18 }}>
              <div className="row" style={{ gap: 12 }}>
                <div style={{ width: 38, height: 48, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 4, display: 'grid', placeItems: 'center', color: 'var(--ink-3)', flexShrink: 0 }}>
                  <Icon.report />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{d}</div>
                  <div className="cell-muted" style={{ fontSize: 11.5 }}>PDF · {(Math.random() * 200 + 80).toFixed(0)} KB</div>
                </div>
                <button className="icon-btn" style={{ width: 30, height: 30 }}><Icon.download /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DataRow({ label, value, mono }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', marginBottom: 3, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 13.5, fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>{value}</div>
    </div>
  );
}

Object.assign(window, { Socios, SocioDetalle });
