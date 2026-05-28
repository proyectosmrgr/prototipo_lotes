// layout.jsx — Sidebar + Topbar + Shell

function Sidebar({ route, onNav, collapsed, db, kpis }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: <Icon.dashboard />, section: 'PRINCIPAL' },
    { id: 'socios', label: 'Socios', icon: <Icon.users />, badge: kpis.totalSocios > 99 ? '99+' : kpis.totalSocios, section: 'GESTIÓN' },
    { id: 'lotes', label: 'Lotes', icon: <Icon.map /> },
    { id: 'asistencias', label: 'Asistencias', icon: <Icon.calendar /> },
    { id: 'pagos', label: 'Pagos', icon: <Icon.creditcard />, badge: kpis.pagosPendientes },
    { id: 'reportes', label: 'Reportes', icon: <Icon.report />, section: 'ANÁLISIS' },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Icon.bell /> },
    { id: 'configuracion', label: 'Configuración', icon: <Icon.settings />, section: 'SISTEMA' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-mark">L</div>
        <div style={{ minWidth: 0 }}>
          <div className="sidebar-name">{db.asociacion.nombre}</div>
          <div className="sidebar-tag">{db.asociacion.subtitulo}</div>
        </div>
      </div>

      <nav className="nav">
        {items.map((it) => (
          <React.Fragment key={it.id}>
            {it.section && <div className="nav-section-label">{it.section}</div>}
            <button
              className={`nav-item ${route === it.id ? 'active' : ''}`}
              onClick={() => onNav(it.id)}
              title={collapsed ? it.label : undefined}
            >
              <span className="nav-icon">{it.icon}</span>
              <span className="nav-label">{it.label}</span>
              {it.badge != null && it.badge > 0 && (
                <span className="nav-badge">{it.badge}</span>
              )}
            </button>
          </React.Fragment>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="avatar">VC</div>
        <div className="sidebar-user-meta">
          <div className="sidebar-user-name">Víctor Carrasco</div>
          <div className="sidebar-user-role">Administrador</div>
        </div>
        <button className="icon-btn sidebar-foot-icon" style={{ width: 28, height: 28, background: 'transparent', border: 'none', color: 'rgba(251,248,241,0.5)' }}>
          <Icon.chevrondown />
        </button>
      </div>
    </aside>
  );
}

function Topbar({ route, onNav, collapsed, onCollapse, onSearch, searchQuery }) {
  const titles = {
    dashboard: ['Inicio', 'Resumen general'],
    socios: ['Inicio', 'Gestión', 'Socios'],
    'socio-detalle': ['Inicio', 'Gestión', 'Socios', 'Perfil'],
    lotes: ['Inicio', 'Gestión', 'Lotes'],
    asistencias: ['Inicio', 'Gestión', 'Asistencias'],
    pagos: ['Inicio', 'Gestión', 'Pagos'],
    reportes: ['Inicio', 'Análisis', 'Reportes'],
    notificaciones: ['Inicio', 'Notificaciones'],
    configuracion: ['Inicio', 'Configuración'],
  };
  const crumbs = titles[route] || ['Inicio'];

  return (
    <div className="topbar">
      <button className="topbar-collapse" onClick={onCollapse} title="Plegar barra">
        <Icon.collapse />
      </button>
      <div className="breadcrumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="breadcrumb-sep">/</span>}
            <span className={i === crumbs.length - 1 ? 'breadcrumb-cur' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="topbar-right">
        <div className="search-box">
          <Icon.search />
          <input
            placeholder="Buscar socios, lotes, pagos…"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
          <span className="kbd">⌘K</span>
        </div>
        <button className="icon-btn" title="Notificaciones" onClick={() => onNav('notificaciones')}>
          <Icon.bell />
          <span className="icon-btn-dot"></span>
        </button>
        <button className="icon-btn" title="Imprimir">
          <Icon.print />
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar });
