import { useState } from 'react';
import { useCalculator } from './hooks/useCalculator';
import Sidebar from './components/Sidebar';
import KpiDashboard from './components/KpiDashboard';
import WarningPanel from './components/WarningPanel';
import TabDetails from './components/tabs/TabDetails';
import TabPattern from './components/tabs/TabPattern';
import TabGround from './components/tabs/TabGround';
import TabLinkbudget from './components/tabs/TabLinkbudget';
import TabNoise from './components/tabs/TabNoise';
import TabCoupling from './components/tabs/TabCoupling';
import TabReceive from './components/tabs/TabReceive';
import TabCircuit from './components/tabs/TabCircuit';
import TabSteps from './components/tabs/TabSteps';
import TabTheory from './components/tabs/TabTheory';
import TabFreqSweep from './components/tabs/TabFreqSweep';
import TabConductorComp from './components/tabs/TabConductorComp';
import TabOptimizer from './components/tabs/TabOptimizer';
import TabCapAssist from './components/tabs/TabCapAssist';
import TabBuild from './components/tabs/TabBuild';

const TABS = [
  { id: 'details',    label: 'Details' },
  { id: 'theory',    label: 'Theorie' },
  { id: 'freqsweep', label: 'Freq Sweep' },
  { id: 'optimizer', label: 'Optimizer' },
  { id: 'conductors',label: 'Geleiders' },
  { id: 'capassist', label: 'Condensator' },
  { id: 'build',     label: 'Bouwlijst' },
  { id: 'pattern',   label: 'Patroon' },
  { id: 'ground',    label: 'Grondeffect' },
  { id: 'linkbudget',label: 'Linkbudget' },
  { id: 'noise',     label: 'Ruis & S/N' },
  { id: 'coupling',  label: 'Koppeling' },
  { id: 'receive',   label: 'Ontvangst' },
  { id: 'circuit',   label: 'Circuit' },
  { id: 'steps',     label: 'Berekenstappen' },
];

export default function App() {
  const [theme, setTheme] = useState<string>('light');
  const [fontSize, setFontSize] = useState<string>('normal');
  const [activeTab, setActiveTab] = useState('details');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 640);
  const calc = useCalculator();

  function applyTheme(t: string) {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }

  function applyFontSize(s: string) {
    setFontSize(s);
    document.documentElement.setAttribute('data-fontsize', s);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
  }

  function openSidebar() { setSidebarOpen(true); }
  function closeSidebar() { setSidebarOpen(false); }

  return (
    <>
      {/* Skip navigation — WCAG 2.4.1 */}
      <a href="#main-content" className="skip-link">Spring naar inhoud</a>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" role="presentation" />
      )}

      <Sidebar
        calc={calc}
        theme={theme} setTheme={applyTheme}
        fontSize={fontSize} setFontSize={applyFontSize}
        isOpen={sidebarOpen} onClose={closeSidebar}
      />

      <main className="main" id="main-content">
        {/* Hamburger bar — mobile/tablet only */}
        <div className="hamburger-bar">
          <button className="hamburger-btn" onClick={openSidebar} aria-label="Open instellingen">
            <span />
            <span />
            <span />
          </button>
          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 16, letterSpacing: 1 }}>
            MagLoop <span style={{ color: 'var(--c-primary)' }}>HamPro</span>
          </span>
          <span style={{ fontFamily: 'Share Tech Mono', fontSize: 9, color: 'var(--muted)', marginLeft: 'auto' }} aria-hidden="true">V1.0 PC3Y</span>
        </div>

        <KpiDashboard results={calc.results} />
        <WarningPanel results={calc.results} inputs={calc.inputs} />

        {/* Tab navigation — WCAG 4.1.2, 1.3.1 */}
        <nav className="tab-nav" role="tablist" aria-label="Secties">
          {TABS.map(t => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              className={"tab-btn" + (activeTab === t.id ? " active" : "")}
              role="tab"
              aria-selected={activeTab === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setActiveTab(t.id)}
            >{t.label}</button>
          ))}
        </nav>

        {/* Single tabpanel wrapper — WCAG 4.1.2 */}
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'details'     && <TabDetails calc={calc} />}
          {activeTab === 'theory'      && <TabTheory results={calc.results} />}
          {activeTab === 'freqsweep'   && <TabFreqSweep calc={calc} />}
          {activeTab === 'optimizer'   && <TabOptimizer calc={calc} />}
          {activeTab === 'conductors'  && <TabConductorComp calc={calc} />}
          {activeTab === 'capassist'   && <TabCapAssist results={calc.results} />}
          {activeTab === 'pattern'     && <TabPattern results={calc.results} inputs={calc.inputs} />}
          {activeTab === 'ground'      && <TabGround calc={calc} />}
          {activeTab === 'linkbudget'  && <TabLinkbudget calc={calc} />}
          {activeTab === 'noise'       && <TabNoise calc={calc} />}
          {activeTab === 'coupling'    && <TabCoupling results={calc.results} />}
          {activeTab === 'receive'     && <TabReceive results={calc.results} />}
          {activeTab === 'build'       && <TabBuild results={calc.results} />}
          {activeTab === 'circuit'     && <TabCircuit results={calc.results} />}
          {activeTab === 'steps'       && <TabSteps steps={calc.results.steps} />}
        </div>
      </main>
    </>
  );
}
