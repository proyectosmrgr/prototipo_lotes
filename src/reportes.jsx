// reportes.jsx — Reportes visuales con exports simulados

function Reportes({ db, toast }) {
  const [reporte, setReporte] = React.useState('pagos');
  const [rango, setRango] = React.useState('6m');
  const [distrito, setDistrito] = React.useState('Todos');

  const distritos = React.useMemo(() => Array.from(new Set(db.socios.map(s => s.distrito))).sort(), [db.socios]);

  const reportes = [
    { id: 'pagos', label: 'Pagos', icon: <Icon.creditcard />, desc: 'Ingresos por mes, concepto y método.' },
    { id: 'morosos', label: 'Morosos', icon: <Icon.alert />, desc: 'Socios con deuda activa, ranking de antigüedad.' },
    { id: 'socios', label: 'Socios', icon: <Icon.users />, desc: 'Composición del padrón, ingresos por año.' },
    { id: 'financiero', label: 'Financiero', icon: <Icon.report />, desc: 'Balance trimestral y proyección de cobranza.' },
  ];

  const triggerExport = (fmt) => {
    toast(`Generando ${fmt.toUpperCase()} — descarga simulada`);
  };

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="section-eyebrow left">Análisis</div>
          <h1 className="page-title">Reportes <em>de la asociación</em></h1>
          <div className="page-subtitle">Generador de informes con vista previa, exportable a PDF o Excel.</div>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={<Icon.excel />} onClick={() => triggerExport('xlsx')}>Excel</Button>
          <Button variant="primary" icon={<Icon.pdf />} onClick={() => triggerExport('pdf')}>PDF</Button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        {reportes.map(r => (
          <div key={r.id} className="card" style={{ padding: 20, cursor: 'pointer', borderColor: reporte === r.id ? 'var(--primary)' : 'var(--line)', background: reporte === r.id ? 'var(--primary-tint)' : 'var(--surface)' }} onClick={() => setReporte(r.id)}>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: reporte === r.id ? 'var(--primary)' : 'var(--surface-2)', color: reporte === r.id ? '#fbf8f1' : 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                {r.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Reporte de {r.label}</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.4 }}>{r.desc}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: 16 }}>
        <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 6 }}>
            <span style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-3)', fontWeight: 500, marginRight: 8 }}>Rango</span>
            {[
              { id: '1m', l: 'Último mes' }, { id: '3m', l: '3 meses' }, { id: '6m', l: '6 meses' }, { id: '12m', l: '12 meses' }, { id: 'all', l: 'Total' },
            ].map(r => (
              <button key={r.id} className={`chip ${rango === r.id ? 'active' : ''}`} onClick={() => setRango(r.id)}>{r.l}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <select className="select" value={distrito} onChange={(e) => setDistrito(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
              <option value="Todos">Todos los distritos</option>
              {distritos.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      {reporte === 'pagos' && <ReportePagos db={db} rango={rango} />}
      {reporte === 'morosos' && <ReporteMorosos db={db} />}
      {reporte === 'socios' && <ReporteSocios db={db} distrito={distrito} />}
      {reporte === 'financiero' && <ReporteFinanciero db={db} />}
    </div>
  );
}

function ReportePagos({ db, rango }) {
  const meses = rango === '1m' ? 1 : rango === '3m' ? 3 : rango === '6m' ? 6 : rango === '12m' ? 12 : 18;
  const data = pagosUltimos12Meses(db).slice(-Math.min(meses, 12));
  // Conceptos breakdown
  const breakdown = {};
  CONCEPTOS_PAGO.forEach(c => { breakdown[c.label] = 0; });
  db.pagos.filter(p => p.estado === 'Pagado').forEach(p => {
    breakdown[p.concepto] = (breakdown[p.concepto] || 0) + p.monto;
  });
  const totalIngresos = data.reduce((s, d) => s + d.ingreso, 0);
  const totalDeuda = data.reduce((s, d) => s + d.deuda, 0);

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Movimiento mensual</div>
              <div className="card-title">Ingresos vs deuda generada</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              Total: <b style={{ color: 'var(--green)' }}>{fmtSoles(totalIngresos)}</b> · Deuda: <b style={{ color: 'var(--red)' }}>{fmtSoles(totalDeuda)}</b>
            </div>
          </div>
          <BarChart data={data} />
        </div>

        <div className="card">
          <div className="card-eyebrow">Por concepto</div>
          <div className="stack" style={{ gap: 12, marginTop: 14 }}>
            {Object.entries(breakdown).sort((a, b) => b[1] - a[1]).map(([label, monto]) => {
              const pct = (monto / Object.values(breakdown).reduce((s, v) => s + v, 0)) * 100;
              return (
                <div key={label}>
                  <div className="row-spread" style={{ fontSize: 12.5, marginBottom: 4 }}>
                    <span>{label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{fmtSoles(monto)}</span>
                  </div>
                  <div className="progress"><div className="progress-bar" style={{ width: `${pct}%` }}></div></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-eyebrow" style={{ marginBottom: 14 }}>Detalle mensual</div>
        <table className="tbl">
          <thead><tr>
            <th>Mes</th><th className="cell-num">Ingresos</th><th className="cell-num">Deuda</th><th className="cell-num">Cobertura</th>
          </tr></thead>
          <tbody>
            {data.map((d, i) => {
              const cobertura = d.deuda > 0 ? Math.round((d.ingreso / (d.ingreso + d.deuda)) * 100) : 100;
              return (
                <tr key={i}>
                  <td className="cell-strong">{d.mes} {d.year}</td>
                  <td className="cell-num cell-mono" style={{ color: 'var(--green)' }}>{fmtSoles(d.ingreso)}</td>
                  <td className="cell-num cell-mono" style={{ color: 'var(--red)' }}>{fmtSoles(d.deuda)}</td>
                  <td className="cell-num">
                    <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                      <span className="cell-mono">{cobertura}%</span>
                      <div className="progress" style={{ width: 70 }}>
                        <div className={`progress-bar ${cobertura > 85 ? 'green' : cobertura > 60 ? 'amber' : 'red'}`} style={{ width: `${cobertura}%` }}></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReporteMorosos({ db }) {
  const morosos = React.useMemo(() => {
    return db.socios.filter(s => s.estado === 'Moroso').map(s => {
      const deudaPagos = db.pagos.filter(p => p.socio_id === s.id && p.estado !== 'Pagado');
      const deuda = deudaPagos.reduce((sum, p) => sum + p.monto, 0);
      const mesesAtrasados = deudaPagos.length;
      return { ...s, deuda, mesesAtrasados };
    }).sort((a, b) => b.deuda - a.deuda);
  }, [db]);

  const totalDeuda = morosos.reduce((s, m) => s + m.deuda, 0);

  return (
    <div>
      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <KPIMini label="Socios morosos" value={morosos.length} icon={<Icon.users />} tone="red" />
        <KPIMini label="Deuda total" value={fmtSoles(totalDeuda)} icon={<Icon.alert />} tone="red" />
        <KPIMini label="Promedio por moroso" value={fmtSoles(totalDeuda / Math.max(morosos.length, 1))} icon={<Icon.report />} tone="amber" />
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">Ranking de morosidad</div>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Ordenado por deuda descendente</span>
        </div>
        <table className="tbl">
          <thead><tr>
            <th>#</th><th>Socio</th><th>Lote</th><th>Contacto</th>
            <th className="cell-num">Meses</th><th className="cell-num">Deuda</th>
          </tr></thead>
          <tbody>
            {morosos.slice(0, 30).map((m, i) => (
              <tr key={m.id}>
                <td><span className="cell-mono" style={{ color: 'var(--ink-3)' }}>{String(i + 1).padStart(2, '0')}</span></td>
                <td><div className="row-avatar">
                  <div className="av" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}>{iniciales(m.nombre_completo)}</div>
                  <div>
                    <div className="cell-strong">{m.nombre_completo}</div>
                    <div className="cell-muted" style={{ fontSize: 11 }}>{m.codigo}</div>
                  </div>
                </div></td>
                <td><span className="cell-mono">{m.lote_id || '—'}</span></td>
                <td><span className="cell-mono">{m.telefono}</span></td>
                <td className="cell-num"><span className="badge red">{m.mesesAtrasados}</span></td>
                <td className="cell-num cell-mono cell-strong" style={{ color: 'var(--red)' }}>{fmtSoles(m.deuda)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReporteSocios({ db, distrito }) {
  const filt = distrito === 'Todos' ? db.socios : db.socios.filter(s => s.distrito === distrito);

  // Por año de ingreso
  const porAnio = {};
  filt.forEach(s => {
    const y = new Date(s.fecha_ingreso).getFullYear();
    porAnio[y] = (porAnio[y] || 0) + 1;
  });

  // Por distrito
  const porDistrito = {};
  filt.forEach(s => { porDistrito[s.distrito] = (porDistrito[s.distrito] || 0) + 1; });

  // Por género
  const m = filt.filter(s => s.genero === 'M').length;
  const f = filt.filter(s => s.genero === 'F').length;

  return (
    <div className="grid grid-2" style={{ gap: 20 }}>
      <div className="card">
        <div className="card-eyebrow" style={{ marginBottom: 14 }}>Ingresos por año</div>
        <div className="stack" style={{ gap: 10 }}>
          {Object.entries(porAnio).sort().map(([y, c]) => {
            const pct = (c / Math.max(...Object.values(porAnio))) * 100;
            return (
              <div key={y}>
                <div className="row-spread" style={{ fontSize: 12.5, marginBottom: 4 }}>
                  <span>{y}</span>
                  <span className="cell-mono">{c} socios</span>
                </div>
                <div className="progress"><div className="progress-bar" style={{ width: `${pct}%` }}></div></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-eyebrow" style={{ marginBottom: 14 }}>Distribución por distrito</div>
        <div className="stack" style={{ gap: 10 }}>
          {Object.entries(porDistrito).sort((a, b) => b[1] - a[1]).map(([d, c]) => {
            const pct = (c / filt.length) * 100;
            return (
              <div key={d}>
                <div className="row-spread" style={{ fontSize: 12.5, marginBottom: 4 }}>
                  <span>{d}</span>
                  <span className="cell-mono">{c} · {pct.toFixed(0)}%</span>
                </div>
                <div className="progress"><div className="progress-bar amber" style={{ width: `${pct}%` }}></div></div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <div className="card-eyebrow" style={{ marginBottom: 14 }}>Composición</div>
        <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <div className="row-spread" style={{ fontSize: 13, marginBottom: 6 }}>
              <span>Masculino</span>
              <span className="cell-mono">{m} · {((m / filt.length) * 100).toFixed(0)}%</span>
            </div>
            <div className="progress"><div className="progress-bar" style={{ width: `${(m / filt.length) * 100}%` }}></div></div>
            <div className="row-spread" style={{ fontSize: 13, margin: '12px 0 6px' }}>
              <span>Femenino</span>
              <span className="cell-mono">{f} · {((f / filt.length) * 100).toFixed(0)}%</span>
            </div>
            <div className="progress"><div className="progress-bar amber" style={{ width: `${(f / filt.length) * 100}%` }}></div></div>
          </div>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 1, color: 'var(--primary)' }}>
              {fmtNum(filt.length)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
              socios registrados{distrito !== 'Todos' ? ` en ${distrito}` : ' en el padrón'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReporteFinanciero({ db }) {
  const ingresoTotal = db.pagos.filter(p => p.estado === 'Pagado').reduce((s, p) => s + p.monto, 0);
  const deudaTotal = db.pagos.filter(p => p.estado !== 'Pagado').reduce((s, p) => s + p.monto, 0);
  const balance = ingresoTotal;
  const proyeccion = deudaTotal * 0.6;

  return (
    <div>
      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <div className="kpi accent">
          <div className="kpi-label">Balance acumulado</div>
          <div className="kpi-value"><span className="unit">S/</span>{fmtNum(Math.round(balance))}</div>
          <div className="kpi-foot"><span className="kpi-delta up">+12.4%</span><span>desde inicio de año</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Deuda en cobranza</div>
          <div className="kpi-value"><span className="unit">S/</span>{fmtNum(Math.round(deudaTotal))}</div>
          <div className="kpi-foot"><span>{db.pagos.filter(p => p.estado !== 'Pagado').length} comprobantes pendientes</span></div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Proyección de cobro</div>
          <div className="kpi-value"><span className="unit">S/</span>{fmtNum(Math.round(proyeccion))}</div>
          <div className="kpi-foot"><span>Estimado 60% deuda · próximo trimestre</span></div>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-eyebrow">Estado de resultados simplificado</div>
            <div className="card-title">Año fiscal en curso</div>
          </div>
        </div>
        <table className="tbl">
          <tbody>
            <tr><td className="cell-strong" style={{ fontSize: 14 }}>Ingresos por cuotas</td><td className="cell-num cell-mono">{fmtSoles(ingresoTotal * 0.7)}</td></tr>
            <tr><td>Ingresos por mantenimiento</td><td className="cell-num cell-mono">{fmtSoles(ingresoTotal * 0.18)}</td></tr>
            <tr><td>Ingresos extraordinarios</td><td className="cell-num cell-mono">{fmtSoles(ingresoTotal * 0.12)}</td></tr>
            <tr style={{ background: 'var(--bg-deep)' }}><td className="cell-strong">Total ingresos</td><td className="cell-num cell-mono cell-strong">{fmtSoles(ingresoTotal)}</td></tr>
            <tr><td className="cell-strong" style={{ fontSize: 14 }}>Egresos administrativos</td><td className="cell-num cell-mono" style={{ color: 'var(--red)' }}>−{fmtSoles(ingresoTotal * 0.22)}</td></tr>
            <tr><td>Mantenimiento de áreas comunes</td><td className="cell-num cell-mono" style={{ color: 'var(--red)' }}>−{fmtSoles(ingresoTotal * 0.31)}</td></tr>
            <tr><td>Seguridad y vigilancia</td><td className="cell-num cell-mono" style={{ color: 'var(--red)' }}>−{fmtSoles(ingresoTotal * 0.19)}</td></tr>
            <tr style={{ background: 'var(--bg-deep)' }}><td className="cell-strong">Total egresos</td><td className="cell-num cell-mono cell-strong" style={{ color: 'var(--red)' }}>−{fmtSoles(ingresoTotal * 0.72)}</td></tr>
            <tr style={{ background: 'var(--primary)', color: '#fbf8f1' }}><td className="cell-strong" style={{ fontSize: 14, color: '#fbf8f1' }}>Resultado del periodo</td><td className="cell-num cell-mono cell-strong" style={{ fontSize: 15, color: '#fbf8f1' }}>{fmtSoles(ingresoTotal * 0.28)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { Reportes });
