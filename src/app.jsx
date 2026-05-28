// app.jsx — Entry point + Router

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "bosque",
  "density": "comfy",
  "asociacion_nombre": "Las Lomas de Pachacámac"
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [db, setDB] = React.useState(() => initDB());
  const [route, setRoute] = React.useState(window.location.hash.replace('#', '') || 'dashboard');
  const [socioId, setSocioId] = React.useState(null);
  const [collapsed, setCollapsed] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [pushToast, toastNode] = useToasts();

  // —— Reflect palette + density on root ——
  React.useEffect(() => {
    document.documentElement.dataset.palette = tweaks.palette || 'bosque';
    document.documentElement.dataset.density = tweaks.density || 'comfy';
  }, [tweaks.palette, tweaks.density]);

  // —— Apply association name from tweak ——
  React.useEffect(() => {
    if (tweaks.asociacion_nombre && tweaks.asociacion_nombre !== db.asociacion.nombre) {
      setDB(d => ({ ...d, asociacion: { ...d.asociacion, nombre: tweaks.asociacion_nombre } }));
    }
  }, [tweaks.asociacion_nombre]);

  // —— Hash routing ——
  React.useEffect(() => {
    const onHash = () => {
      const r = window.location.hash.replace('#', '');
      if (r.startsWith('socio/')) {
        const id = parseInt(r.split('/')[1], 10);
        setSocioId(id);
        setRoute('socio-detalle');
      } else if (r) {
        setRoute(r);
        setSocioId(null);
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // —— Persist DB on changes ——
  React.useEffect(() => { saveDB(db); }, [db]);

  // —— Computed KPIs ——
  const kpis = React.useMemo(() => calcKPIs(db), [db]);

  // —— Nav helpers ——
  const go = (r) => { window.location.hash = r; setRoute(r); setSocioId(null); };
  const openSocio = (id) => { window.location.hash = `socio/${id}`; setSocioId(id); setRoute('socio-detalle'); };

  // —— Keyboard shortcut for sidebar ——
  React.useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault(); setCollapsed(c => !c);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('.topbar .search-box input')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="shell" data-collapsed={collapsed}>
      <Sidebar route={route} onNav={go} collapsed={collapsed} db={db} kpis={kpis} />
      <div className="main">
        <Topbar
          route={route}
          onNav={go}
          collapsed={collapsed}
          onCollapse={() => setCollapsed(c => !c)}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
        />
        <div className="page">
          {route === 'dashboard' && <Dashboard db={db} kpis={kpis} onNav={go} onOpenSocio={openSocio} />}
          {route === 'socios' && <Socios db={db} setDB={setDB} onOpenSocio={openSocio} toast={pushToast} globalSearch={searchQuery} />}
          {route === 'socio-detalle' && socioId && <SocioDetalle db={db} socioId={socioId} onBack={() => go('socios')} onNav={go} setDB={setDB} toast={pushToast} />}
          {route === 'lotes' && <Lotes db={db} setDB={setDB} onOpenSocio={openSocio} toast={pushToast} />}
          {route === 'asistencias' && <Asistencias db={db} toast={pushToast} />}
          {route === 'pagos' && <Pagos db={db} setDB={setDB} onOpenSocio={openSocio} toast={pushToast} />}
          {route === 'reportes' && <Reportes db={db} toast={pushToast} />}
          {route === 'notificaciones' && <Notificaciones db={db} />}
          {route === 'configuracion' && <Configuracion db={db} setDB={setDB} toast={pushToast} />}
        </div>
      </div>

      {toastNode}

      <TweaksPanel>
        <TweakSection label="Identidad" />
        <TweakText
          label="Nombre"
          value={tweaks.asociacion_nombre}
          onChange={(v) => setTweak('asociacion_nombre', v)}
        />
        <TweakSection label="Paleta de marca" />
        <TweakRadio
          label="Paleta"
          value={tweaks.palette}
          options={[
            { value: 'bosque', label: 'Bosque' },
            { value: 'tierra', label: 'Tierra' },
            { value: 'tinta', label: 'Tinta' },
            { value: 'marina', label: 'Marina' },
          ]}
          onChange={(v) => setTweak('palette', v)}
        />
        <TweakSection label="Layout" />
        <TweakRadio
          label="Densidad"
          value={tweaks.density}
          options={[
            { value: 'comfy', label: 'Cómoda' },
            { value: 'compact', label: 'Compacta' },
          ]}
          onChange={(v) => setTweak('density', v)}
        />
        <TweakSection label="Datos" />
        <TweakButton label="Reiniciar datos demo" onClick={() => { resetDB(); location.reload(); }} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
