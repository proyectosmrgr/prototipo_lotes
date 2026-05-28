// stubs.jsx — Asistencias, Notificaciones, Configuración

// ============================================================
// Asistencias — Calendario + tabla
// ============================================================
function Asistencias({ db, toast }) {
  const [mes, setMes] = React.useState(new Date().getMonth());
  const [anio, setAnio] = React.useState(new Date().getFullYear());

  // Generamos datos mock de asistencias para la última asamblea
  const ultimaAsamblea = new Date(anio, mes, 15);
  const presentesPct = 72;
  const presentes = Math.round((db.socios.length * presentesPct) / 100);
  const tardanzas = 24;
  const faltas = db.socios.length - presentes - tardanzas;

  // Calendario mensual
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const primerDia = new Date(anio, mes, 1).getDay();
  const dias = [];
  for (let i = 0; i < primerDia; i++) dias.push(null);
  for (let d = 1; d <= diasMes; d++) dias.push(d);

  // Eventos mock
  const eventos = [
    { dia: 5, tipo: 'Reunión directiva', estado: 'realizado' },
    { dia: 15, tipo: 'Asamblea general', estado: 'realizado' },
    { dia: 22, tipo: 'Faena comunal', estado: mes === new Date().getMonth() ? 'pendiente' : 'realizado' },
    { dia: 28, tipo: 'Comité de obras', estado: 'pendiente' },
  ];
  const eventosMap = {};
  eventos.forEach(e => { eventosMap[e.dia] = e; });

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="section-eyebrow left">Gestión</div>
          <h1 className="page-title">Control de <em>asistencias</em></h1>
          <div className="page-subtitle">Reuniones, asambleas y faenas comunales. Asistencia obligatoria según estatutos.</div>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={<Icon.download />}>Lista de asistencia</Button>
          <Button variant="primary" icon={<Icon.plus />}>Nueva reunión</Button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <KPIMini label="Asistencia promedio" value="78%" icon={<Icon.check />} tone="green" />
        <KPIMini label="Presentes (última)" value={presentes} icon={<Icon.users />} tone="green" />
        <KPIMini label="Tardanzas" value={tardanzas} icon={<Icon.calendar />} tone="amber" />
        <KPIMini label="Faltas injustificadas" value={faltas} icon={<Icon.alert />} tone="red" />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Calendario</div>
              <div className="card-title">{['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][mes]} {anio}</div>
            </div>
            <div className="row">
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => { if (mes === 0) { setMes(11); setAnio(anio - 1); } else setMes(mes - 1); }}><Icon.chevronleft /></button>
              <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => { if (mes === 11) { setMes(0); setAnio(anio + 1); } else setMes(mes + 1); }}><Icon.chevronright /></button>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {['D','L','M','M','J','V','S'].map((d, i) => (
              <div key={i} style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', textAlign: 'center', padding: 6, fontWeight: 500 }}>{d}</div>
            ))}
            {dias.map((d, i) => {
              const ev = d ? eventosMap[d] : null;
              const isToday = d === new Date().getDate() && mes === new Date().getMonth() && anio === new Date().getFullYear();
              return (
                <div key={i} style={{
                  aspectRatio: 1, padding: 6,
                  background: ev ? (ev.estado === 'pendiente' ? 'var(--amber-soft)' : 'var(--green-soft)') : 'var(--surface)',
                  border: `1px solid ${isToday ? 'var(--primary)' : ev ? (ev.estado === 'pendiente' ? 'var(--amber)' : 'var(--green)') : 'var(--line-soft)'}`,
                  borderRadius: 6,
                  borderWidth: isToday ? 2 : 1,
                  display: 'flex', flexDirection: 'column',
                  cursor: ev ? 'pointer' : 'default',
                  fontSize: 12,
                  position: 'relative',
                }}>
                  {d && <>
                    <span style={{ fontWeight: isToday ? 600 : 400, color: ev ? (ev.estado === 'pendiente' ? 'var(--amber)' : 'var(--green)') : 'var(--ink-2)' }}>{d}</span>
                    {ev && <span style={{ fontSize: 9, lineHeight: 1.2, marginTop: 'auto', color: ev.estado === 'pendiente' ? 'var(--amber)' : 'var(--green)', fontWeight: 500 }}>{ev.tipo}</span>}
                  </>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-eyebrow" style={{ marginBottom: 14 }}>Asamblea del 15 de {['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][mes]}</div>
          <DonutAsistencia presentes={presentes} tardanzas={tardanzas} faltas={faltas} total={db.socios.length} />
          <div className="divider"></div>
          <div className="card-eyebrow" style={{ marginBottom: 12 }}>Ranking · top 5</div>
          <div className="stack" style={{ gap: 8 }}>
            {db.socios.slice(0, 5).map((s, i) => (
              <div key={s.id} className="row" style={{ gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: i < 3 ? 'var(--accent)' : 'var(--surface-2)', color: i < 3 ? '#fbf8f1' : 'var(--ink-2)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600 }}>{i + 1}</div>
                <div style={{ flex: 1, fontSize: 12.5 }}>{s.nombre_completo}</div>
                <span className="cell-mono" style={{ fontSize: 11.5 }}>{100 - i * 2}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="table-wrap" style={{ marginTop: 20 }}>
        <div className="table-toolbar">
          <div className="card-title">Registro · Asamblea {fmtFecha(ultimaAsamblea.toISOString())}</div>
          <div className="table-toolbar-right">
            <Button variant="secondary" size="sm" icon={<Icon.print />}>Imprimir lista</Button>
          </div>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>Socio</th><th>Código</th><th>Lote</th><th>Hora ingreso</th><th>Estado</th>
          </tr></thead>
          <tbody>
            {db.socios.slice(0, 10).map((s, i) => {
              const estados = ['Presente', 'Presente', 'Presente', 'Tardanza', 'Falta', 'Justificado'];
              const est = estados[i % estados.length];
              return (
                <tr key={s.id}>
                  <td><div className="row-avatar">
                    <div className="av">{iniciales(s.nombre_completo)}</div>
                    <div className="cell-strong">{s.nombre_completo}</div>
                  </div></td>
                  <td><span className="cell-mono">{s.codigo}</span></td>
                  <td><span className="cell-mono">{s.lote_id || '—'}</span></td>
                  <td className="cell-muted">{est === 'Presente' ? '19:0' + (i % 5) : est === 'Tardanza' ? '19:4' + (i % 5) : '—'}</td>
                  <td><StatusBadge value={est} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DonutAsistencia({ presentes, tardanzas, faltas, total }) {
  const items = [
    { k: 'Presentes', v: presentes, color: 'var(--green)' },
    { k: 'Tardanzas', v: tardanzas, color: 'var(--amber)' },
    { k: 'Faltas', v: faltas, color: 'var(--red)' },
  ];
  const r = 60, rIn = 42; const cx = 90, cy = 90;
  let acc = 0;
  return (
    <div className="row" style={{ gap: 16 }}>
      <svg viewBox="0 0 180 180" style={{ width: 140, height: 140 }}>
        {items.map(it => {
          const s = (acc / total) * Math.PI * 2 - Math.PI / 2;
          acc += it.v;
          const e = (acc / total) * Math.PI * 2 - Math.PI / 2;
          const large = e - s > Math.PI ? 1 : 0;
          const x1 = cx + Math.cos(s) * r, y1 = cy + Math.sin(s) * r;
          const x2 = cx + Math.cos(e) * r, y2 = cy + Math.sin(e) * r;
          const x3 = cx + Math.cos(e) * rIn, y3 = cy + Math.sin(e) * rIn;
          const x4 = cx + Math.cos(s) * rIn, y4 = cy + Math.sin(s) * rIn;
          return <path key={it.k} d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4} Z`} fill={it.color} stroke="var(--surface)" strokeWidth="2" />;
        })}
        <text x={cx} y={cy - 2} textAnchor="middle" fontFamily="var(--font-display)" fontSize="28" fill="var(--ink)">{Math.round((presentes / total) * 100)}%</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--ink-3)" letterSpacing="0.1em">ASISTENCIA</text>
      </svg>
      <div className="stack" style={{ gap: 6, flex: 1, fontSize: 12 }}>
        {items.map(it => (
          <div key={it.k} className="row-spread">
            <span className="row" style={{ gap: 6 }}><span className="dot" style={{ background: it.color }}></span>{it.k}</span>
            <span className="cell-mono">{it.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Notificaciones
// ============================================================
function Notificaciones({ db }) {
  const notifs = React.useMemo(() => {
    const out = [];
    let id = 1;
    db.socios.filter(s => s.estado === 'Moroso').slice(0, 8).forEach(s => {
      out.push({ id: id++, tipo: 'mora', titulo: 'Pago vencido', texto: `${s.nombre_completo} tiene cuotas pendientes desde hace 3 meses.`, fecha: new Date(Date.now() - Math.random() * 5 * 86400000), leida: false });
    });
    db.actividad.slice(0, 6).forEach(a => {
      out.push({ id: id++, tipo: 'actividad', titulo: 'Movimiento', texto: a.texto, fecha: new Date(a.fecha), leida: Math.random() < 0.5 });
    });
    out.push({ id: id++, tipo: 'sistema', titulo: 'Asamblea próxima', texto: 'La asamblea general ordinaria está programada para el viernes 15.', fecha: new Date(Date.now() - 86400000), leida: false });
    return out.sort((a, b) => b.fecha - a.fecha);
  }, [db]);
  const noLeidas = notifs.filter(n => !n.leida).length;

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="section-eyebrow left">Centro de notificaciones</div>
          <h1 className="page-title">Notificaciones <em>recientes</em></h1>
          <div className="page-subtitle">{noLeidas} sin leer de {notifs.length} en total.</div>
        </div>
        <div className="page-actions">
          <Button variant="secondary">Marcar todas como leídas</Button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {notifs.map((n, i) => (
          <div key={n.id} className="row" style={{ gap: 16, padding: '16px 22px', borderBottom: i < notifs.length - 1 ? '1px solid var(--line-soft)' : 'none', background: n.leida ? 'transparent' : 'var(--surface-2)' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%',
              background: n.tipo === 'mora' ? 'var(--red-soft)' : n.tipo === 'sistema' ? 'var(--blue-soft)' : 'var(--primary-tint)',
              color: n.tipo === 'mora' ? 'var(--red)' : n.tipo === 'sistema' ? 'var(--blue)' : 'var(--primary)',
              display: 'grid', placeItems: 'center', flexShrink: 0,
            }}>
              {n.tipo === 'mora' ? <Icon.alert /> : n.tipo === 'sistema' ? <Icon.bell /> : <Icon.users />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="row" style={{ gap: 8, marginBottom: 2 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.titulo}</div>
                {!n.leida && <span className="dot" style={{ background: 'var(--accent)' }}></span>}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{n.texto}</div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{fmtFecha(n.fecha.toISOString(), { relative: true })}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Configuración
// ============================================================
function Configuracion({ db, setDB, toast }) {
  const [tab, setTab] = React.useState('asociacion');
  const [nombre, setNombre] = React.useState(db.asociacion.nombre);
  const [sub, setSub] = React.useState(db.asociacion.subtitulo);

  const guardar = () => {
    setDB({ ...db, asociacion: { ...db.asociacion, nombre, subtitulo: sub } });
    toast('Datos de la asociación actualizados');
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="section-eyebrow left">Sistema</div>
          <h1 className="page-title">Configuración <em>general</em></h1>
          <div className="page-subtitle">Datos institucionales, cuotas, usuarios del sistema y preferencias.</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '220px 1fr', gap: 24 }}>
        <div className="stack" style={{ gap: 2 }}>
          {[
            { id: 'asociacion', label: 'Datos de asociación' },
            { id: 'cuotas', label: 'Cuotas y conceptos' },
            { id: 'usuarios', label: 'Usuarios del sistema' },
            { id: 'seguridad', label: 'Seguridad' },
            { id: 'tema', label: 'Apariencia' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              border: 'none', background: tab === t.id ? 'var(--primary-tint)' : 'transparent',
              color: tab === t.id ? 'var(--primary)' : 'var(--ink-2)',
              padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
              textAlign: 'left', fontSize: 13, fontWeight: tab === t.id ? 600 : 400,
            }}>{t.label}</button>
          ))}
        </div>

        <div className="card">
          {tab === 'asociacion' && (
            <div className="stack" style={{ gap: 18 }}>
              <div className="card-title">Datos institucionales</div>
              <div className="field">
                <label className="field-label">Nombre</label>
                <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">Subtítulo / tipo</label>
                <input className="input" value={sub} onChange={(e) => setSub(e.target.value)} />
              </div>
              <div className="grid grid-2" style={{ gap: 14 }}>
                <div className="field"><label className="field-label">RUC</label><input className="input" defaultValue="20100234567" /></div>
                <div className="field"><label className="field-label">Teléfono</label><input className="input" defaultValue="987 654 321" /></div>
                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label className="field-label">Dirección</label>
                  <input className="input" defaultValue="Av. Los Próceres 456, Pachacámac, Lima" />
                </div>
              </div>
              <div>
                <Button variant="primary" onClick={guardar}>Guardar cambios</Button>
              </div>
            </div>
          )}

          {tab === 'cuotas' && (
            <div className="stack" style={{ gap: 14 }}>
              <div className="card-title">Conceptos de cobranza</div>
              <table className="tbl">
                <thead><tr><th>Concepto</th><th>Periodicidad</th><th className="cell-num">Monto base</th><th>Estado</th></tr></thead>
                <tbody>
                  {CONCEPTOS_PAGO.map(c => (
                    <tr key={c.id}>
                      <td className="cell-strong">{c.label}</td>
                      <td>{c.id === 'cuota' || c.id === 'mantenimiento' || c.id === 'agua' || c.id === 'seguridad' ? 'Mensual' : c.id === 'extraordinaria' ? 'Eventual' : 'Por incidencia'}</td>
                      <td className="cell-num cell-mono">{fmtSoles(c.monto)}</td>
                      <td><StatusBadge value="Activo" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'usuarios' && (
            <div className="stack" style={{ gap: 14 }}>
              <div className="row-spread">
                <div className="card-title">Usuarios del sistema</div>
                <Button variant="primary" size="sm" icon={<Icon.plus />}>Nuevo usuario</Button>
              </div>
              <table className="tbl">
                <thead><tr><th>Usuario</th><th>Rol</th><th>Último acceso</th><th>Estado</th></tr></thead>
                <tbody>
                  {[
                    { n: 'Víctor Carrasco', r: 'Administrador', f: 'Hoy, 09:24', e: 'Activo' },
                    { n: 'Lucía Sánchez', r: 'Tesorera', f: 'Ayer, 16:48', e: 'Activo' },
                    { n: 'Carlos Mamani', r: 'Secretario', f: '23 May', e: 'Activo' },
                    { n: 'Rosa Quispe', r: 'Cobrador', f: '18 May', e: 'Suspendido' },
                  ].map((u, i) => (
                    <tr key={i}>
                      <td><div className="row-avatar">
                        <div className="av">{iniciales(u.n)}</div>
                        <div className="cell-strong">{u.n}</div>
                      </div></td>
                      <td>{u.r}</td>
                      <td className="cell-muted">{u.f}</td>
                      <td><StatusBadge value={u.e} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'seguridad' && (
            <div className="stack" style={{ gap: 18 }}>
              <div className="card-title">Seguridad y respaldos</div>
              <ToggleRow label="Autenticación en dos pasos" desc="Requerir código adicional al iniciar sesión." active />
              <ToggleRow label="Bloqueo automático tras 10 min" desc="Cerrar sesión por inactividad." active />
              <ToggleRow label="Registro de auditoría" desc="Guardar histórico de cambios y accesos." active />
              <ToggleRow label="Backups automáticos diarios" desc="Respaldo en la nube cada 24 horas." />
              <div className="divider"></div>
              <div>
                <Button variant="danger" icon={<Icon.trash />} onClick={() => { resetDB(); location.reload(); }}>Reiniciar datos del sistema</Button>
                <div className="cell-muted" style={{ fontSize: 12, marginTop: 8 }}>Borra todos los datos locales y regenera el padrón con valores semilla.</div>
              </div>
            </div>
          )}

          {tab === 'tema' && (
            <div>
              <div className="card-title" style={{ marginBottom: 14 }}>Apariencia</div>
              <p className="muted" style={{ fontSize: 13.5 }}>
                Las preferencias visuales (paleta, densidad, nombre de la asociación) se gestionan desde el panel <b>Tweaks</b> en la esquina inferior derecha — actívelo desde la barra superior del entorno.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, active }) {
  const [on, setOn] = React.useState(!!active);
  return (
    <div className="row-spread">
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        <div className="cell-muted" style={{ fontSize: 12 }}>{desc}</div>
      </div>
      <button onClick={() => setOn(!on)} style={{
        width: 40, height: 22, borderRadius: 100, border: 'none',
        background: on ? 'var(--primary)' : 'var(--line)', position: 'relative', cursor: 'pointer',
        transition: 'background 160ms',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: on ? 20 : 2,
          width: 18, height: 18, borderRadius: '50%',
          background: '#fbf8f1', transition: 'left 160ms', boxShadow: 'var(--shadow-1)',
        }}></span>
      </button>
    </div>
  );
}

Object.assign(window, { Asistencias, Notificaciones, Configuracion });
