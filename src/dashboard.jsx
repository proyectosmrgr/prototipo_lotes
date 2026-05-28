// dashboard.jsx — Página de inicio

function Dashboard({ db, kpis, onNav, onOpenSocio }) {
  const pagosData = React.useMemo(() => pagosUltimos12Meses(db), [db]);
  const loteDist = React.useMemo(() => distribucionEstadoLotes(db), [db]);

  const ultimosPagos = React.useMemo(
    () => db.pagos.filter(p => p.estado === 'Pagado').sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago)).slice(0, 5),
    [db]
  );
  const vencimientos = React.useMemo(() => {
    const hoy = new Date();
    return db.pagos
      .filter(p => p.estado === 'Pendiente' || p.estado === 'Vencido')
      .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))
      .slice(0, 5);
  }, [db]);

  const ingresoSerieSpark = pagosData.map(p => p.ingreso);
  const moraSerieSpark = pagosData.map(p => p.deuda);

  return (
    <div className="fade-in">
      <div className="page-head">
        <div>
          <div className="section-eyebrow left">Dashboard · {new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <h1 className="page-title">Buenos días, <em>Víctor</em>.</h1>
          <div className="page-subtitle">Aquí tiene un resumen del movimiento de la asociación. El cierre del mes actual está pendiente — {kpis.pagosPendientes} pagos por cobrar suman {fmtSoles(kpis.deudaTotal)}.</div>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={<Icon.download />}>Exportar resumen</Button>
          <Button variant="primary" icon={<Icon.plus />} onClick={() => onNav('socios')}>Nuevo socio</Button>
        </div>
      </div>

      {/* KPI Row 1: 4 grandes */}
      <div className="grid grid-4 stagger" style={{ marginBottom: 20 }}>
        <KPICard label="Total de socios" value={kpis.totalSocios} delta="+12" deltaLabel="este mes" sparkData={[480, 490, 495, 500, 510, 520, 528, 530, 535, 538, 540, kpis.totalSocios]} />
        <KPICard label="Ingreso del mes" value={fmtSoles(kpis.ingresoMes)} valueFormat="raw" delta="+8.4%" sparkData={ingresoSerieSpark} />
        <KPICard label="Deuda por cobrar" value={fmtSoles(kpis.deudaTotal)} valueFormat="raw" delta="−3.1%" deltaPositive sparkData={moraSerieSpark} sparkColor="var(--red)" tone="danger" />
        <KPICard label="Lotes ocupados" value={`${loteDist.Ocupado + loteDist.Moroso}/${db.lotes.length}`} valueFormat="raw" subtitle={`${Math.round(((loteDist.Ocupado + loteDist.Moroso) / db.lotes.length) * 100)}% de ocupación`} />
      </div>

      {/* KPI Row 2: 4 medianos */}
      <div className="grid grid-4 stagger" style={{ marginBottom: 28 }}>
        <KPIMini label="Pagos pendientes" value={kpis.pagosPendientes} icon={<Icon.creditcard />} tone="amber" />
        <KPIMini label="Socios morosos" value={kpis.morosos} icon={<Icon.alert />} tone="red" />
        <KPIMini label="Nuevos socios (90d)" value={kpis.nuevosSocios} icon={<Icon.users />} tone="green" />
        <KPIMini label="Asistencias del mes" value={kpis.asistenciasMes} icon={<Icon.calendar />} tone="blue" />
      </div>

      {/* Charts row */}
      <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Movimiento</div>
              <div className="card-title">Ingresos vs Deuda generada · últimos 12 meses</div>
            </div>
            <div className="row" style={{ gap: 14, fontSize: 12, color: 'var(--ink-3)' }}>
              <span className="row" style={{ gap: 6 }}><span className="dot" style={{ background: 'var(--primary)' }}></span>Ingresos</span>
              <span className="row" style={{ gap: 6 }}><span className="dot" style={{ background: 'var(--accent)' }}></span>Deuda</span>
            </div>
          </div>
          <BarChart data={pagosData} />
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Lotes</div>
              <div className="card-title">Estado actual</div>
            </div>
          </div>
          <DonutChart data={loteDist} total={db.lotes.length} />
        </div>
      </div>

      {/* Lists row */}
      <div className="grid grid-3" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Cobranza</div>
              <div className="card-title">Últimos pagos</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('pagos')}>Ver todos <Icon.arrowright /></button>
          </div>
          <div className="stack" style={{ gap: 0 }}>
            {ultimosPagos.map((p) => {
              const socio = db.socios.find(s => s.id === p.socio_id);
              return (
                <div key={p.id} className="row-spread" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <div className="row-avatar">
                    <div className="av">{iniciales(socio?.nombre_completo || '?')}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{socio?.nombre_completo}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.concepto} · {p.periodo}</div>
                    </div>
                  </div>
                  <div className="right">
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{fmtSoles(p.monto)}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{fmtFecha(p.fecha_pago, { relative: true })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Atención</div>
              <div className="card-title">Próximos vencimientos</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('pagos')}>Ver todos <Icon.arrowright /></button>
          </div>
          <div className="stack" style={{ gap: 0 }}>
            {vencimientos.map((p) => {
              const socio = db.socios.find(s => s.id === p.socio_id);
              return (
                <div key={p.id} className="row-spread" style={{ padding: '10px 0', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }} onClick={() => onOpenSocio(socio.id)}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{socio?.nombre_completo}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.concepto} · vence {fmtFecha(p.fecha_vencimiento)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500 }}>{fmtSoles(p.monto)}</div>
                    <StatusBadge value={p.estado} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-eyebrow">Actividad</div>
              <div className="card-title">Últimos registros</div>
            </div>
            <button className="btn btn-ghost btn-sm">Filtrar <Icon.filter /></button>
          </div>
          <div className="stack" style={{ gap: 12 }}>
            {db.actividad.slice(0, 6).map((a) => (
              <div key={a.id} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-tint)', color: 'var(--primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {a.icon === 'creditcard' && <Icon.creditcard />}
                  {a.icon === 'user-plus' && <Icon.users />}
                  {a.icon === 'map' && <Icon.map />}
                  {a.icon === 'bell' && <Icon.bell />}
                </div>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <div style={{ lineHeight: 1.4 }}>{a.texto}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{fmtFecha(a.fecha, { relative: true })}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, valueFormat, delta, deltaLabel, deltaPositive, sparkData, sparkColor, subtitle, tone }) {
  const isUp = delta && (delta.startsWith('+') || delta.startsWith('↑'));
  const isDown = delta && (delta.startsWith('−') || delta.startsWith('-') || delta.startsWith('↓'));
  const deltaClass = tone === 'danger' ? (deltaPositive ? 'up' : 'down') : (isUp ? 'up' : isDown ? 'down' : 'flat');

  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">
        {valueFormat === 'raw' ? value : <>{fmtNum(value)}</>}
      </div>
      <div className="kpi-foot">
        {delta && <span className={`kpi-delta ${deltaClass}`}>
          {isUp && <Icon.arrowup />}
          {isDown && <Icon.arrowdown />}
          {delta}
        </span>}
        <span>{deltaLabel || subtitle || 'vs. periodo anterior'}</span>
      </div>
      {sparkData && <Sparkline data={sparkData} color={sparkColor} />}
    </div>
  );
}

function KPIMini({ label, value, icon, tone }) {
  const toneColor = { amber: 'var(--amber)', red: 'var(--red)', green: 'var(--green)', blue: 'var(--blue)' }[tone] || 'var(--primary)';
  const toneSoft = { amber: 'var(--amber-soft)', red: 'var(--red-soft)', green: 'var(--green-soft)', blue: 'var(--blue-soft)' }[tone] || 'var(--primary-tint)';
  return (
    <div className="kpi" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: toneSoft, color: toneColor, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.1, marginTop: 2 }}>{fmtNum(value)}</div>
      </div>
    </div>
  );
}

// —— Bar chart (ingresos vs deuda) ——
function BarChart({ data }) {
  const w = 800, h = 240, pad = { l: 44, r: 16, t: 12, b: 28 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const max = Math.max(...data.flatMap(d => [d.ingreso, d.deuda])) * 1.15;
  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => Math.round((max * i) / ticks));
  const groupW = innerW / data.length;
  const barW = (groupW - 8) / 2;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" preserveAspectRatio="xMidYMid meet" style={{ height: 280 }}>
      <g className="chart-grid">
        {tickVals.map((v, i) => {
          const y = pad.t + innerH - (v / max) * innerH;
          return <line key={i} x1={pad.l} x2={w - pad.r} y1={y} y2={y} />;
        })}
      </g>
      <g className="chart-axis">
        {tickVals.map((v, i) => {
          const y = pad.t + innerH - (v / max) * innerH;
          return <text key={i} x={pad.l - 8} y={y + 4} textAnchor="end">S/{(v / 1000).toFixed(0)}k</text>;
        })}
      </g>
      {data.map((d, i) => {
        const x = pad.l + i * groupW + 4;
        const ingY = pad.t + innerH - (d.ingreso / max) * innerH;
        const deuY = pad.t + innerH - (d.deuda / max) * innerH;
        return (
          <g key={i}>
            <rect x={x} y={ingY} width={barW} height={pad.t + innerH - ingY} fill="var(--primary)" rx="2" />
            <rect x={x + barW + 4} y={deuY} width={barW} height={pad.t + innerH - deuY} fill="var(--accent)" rx="2" opacity="0.85" />
            <text x={x + barW + 2} y={h - 10} textAnchor="middle" className="chart-axis" fontSize="10" fill="var(--ink-3)">{d.mes}</text>
          </g>
        );
      })}
    </svg>
  );
}

// —— Donut chart (estado lotes) ——
function DonutChart({ data, total }) {
  const colors = { Ocupado: 'var(--primary)', Disponible: 'var(--blue)', Reservado: 'var(--amber)', Moroso: 'var(--red)' };
  const r = 70, rIn = 48;
  const cx = 100, cy = 100;
  let acc = 0;
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  return (
    <div>
      <svg viewBox="0 0 200 200" style={{ width: '100%', maxWidth: 200, display: 'block', margin: '0 auto 18px' }}>
        {entries.map(([k, v], i) => {
          const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
          acc += v;
          const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
          const large = end - start > Math.PI ? 1 : 0;
          const x1 = cx + Math.cos(start) * r, y1 = cy + Math.sin(start) * r;
          const x2 = cx + Math.cos(end) * r, y2 = cy + Math.sin(end) * r;
          const x3 = cx + Math.cos(end) * rIn, y3 = cy + Math.sin(end) * rIn;
          const x4 = cx + Math.cos(start) * rIn, y4 = cy + Math.sin(start) * rIn;
          return (
            <path key={k}
              d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4} Z`}
              fill={colors[k]} stroke="var(--surface)" strokeWidth="2"
            />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="var(--font-display)" fontSize="32" fill="var(--ink)">{total}</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="10" fill="var(--ink-3)" letterSpacing="0.1em">LOTES</text>
      </svg>
      <div className="stack" style={{ gap: 8 }}>
        {entries.map(([k, v]) => (
          <div key={k} className="row-spread" style={{ fontSize: 12.5 }}>
            <span className="row" style={{ gap: 8 }}>
              <span className="dot" style={{ background: colors[k] }}></span>
              {k}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-2)' }}>{v} <span style={{ color: 'var(--ink-3)' }}>· {Math.round((v / total) * 100)}%</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
