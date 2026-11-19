import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, ExternalLink, FileText, Github, Globe, GraduationCap, Mail, MapPin, Menu, Phone, Server, Smartphone, Sparkles, UserRound, X } from 'lucide-react';
import { projects, type Project } from './data/projects';
import { profile } from './data/profile';
import { contact, education, experience, type TimelineItem } from './data/site';
import { motion } from 'motion/react';
import HeroIntro from './HeroIntro';
import ProfileBadge from './ProfileBadge';
import ProjectShowcase from './ProjectShowcase';
import BoardViewer from './BoardViewer';

const userGitHub = 'https://github.com/hyehye12';
const projectCount = String(projects.length).padStart(2, '0');
// public 폴더 파일('/images/..')은 배포 경로(/hyemin_fullstack/)를 붙여야 열립니다. 외부 URL은 그대로 둡니다.
const asset = (src: string) => src.startsWith('/') && !src.startsWith('//') ? import.meta.env.BASE_URL + src.slice(1) : src;

function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);
  const jump = (id: string) => {
    setOpen(false);
    if (location.pathname !== '/') navigate('/#' + id);
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  return <header className="site-header">
    <div className="page-width header-inside">
      <Link to="/" className="brand" aria-label="곽혜민 포트폴리오 홈"><span className="brand-mark">h.</span><span>HYE MIN KWAK <span className="brand-dot">/</span> DEV</span></Link>
      <nav className="desktop-nav" aria-label="주 메뉴">
        <button onClick={() => jump('about')}>About</button>
        <button onClick={() => jump('projects')}>Projects</button>
        <button onClick={() => jump('skills')}>Skills</button>
        <button onClick={() => jump('journey')}>Education</button>
      </nav>
      <a className="header-contact" href={userGitHub} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></a>
      <button className="mobile-menu" aria-label={open ? '메뉴 닫기' : '메뉴 열기'} onClick={() => setOpen(x => !x)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
    </div>
    {open && <nav className="mobile-nav" aria-label="모바일 메뉴">{[['about','About'],['projects','Projects'],['skills','Skills'],['journey','Education']].map(([id,t]) => <button key={id} onClick={() => jump(id)}>{t}</button>)}</nav>}
  </header>;
}

function ImagePanel({ project, detail = false }: { project: Project; detail?: boolean }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [project.image]);
  if (project.videos?.length) return <div className={`project-video-list ${detail ? 'detail-video-list' : ''}`}>
    {(detail ? project.videos : project.videos.slice(0, 1)).map(video => <figure key={video.src}>
      <video controls playsInline preload="metadata" aria-label={video.label} src={`${asset(video.src)}#t=0.1`} />
      <figcaption>{video.label}</figcaption>
    </figure>)}
  </div>;
  return <div className={`project-visual visual-${project.fallback} ${project.imageFit === 'contain' ? 'visual-contain' : ''} ${detail ? 'detail-visual' : ''}`}>
    {project.image && !failed ? <img src={asset(project.image)} alt={`${project.title} 서비스 화면`} loading="lazy" onError={() => setFailed(true)} /> : <div className="visual-fallback" aria-hidden="true">
      <span className="circuit-lines"/>
      {project.fallback === 'web' && <Globe size={72} strokeWidth={1.1} />}
      {project.fallback === 'server' && <Server size={72} strokeWidth={1.1} />}
      {project.fallback === 'mobile' && <Smartphone size={72} strokeWidth={1.1} />}
      {project.fallback === 'ai' && <Sparkles size={72} strokeWidth={1.1} />}
    </div>}
    <span className="image-index">{project.index} / {projectCount}</span>
  </div>;
}

function ProjectCard({ project, order = 0 }: { project: Project; order?: number }) {
  return <motion.article className="project-card group"
    initial={{ opacity: 0, y: 36 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.6, delay: (order % 2) * 0.12, ease: [0.22, 1, 0.36, 1] }}>
    {project.videos?.length ? <ImagePanel project={project} /> : <Link to={`/projects/${project.slug}`} aria-label={`${project.title} 상세 보기`}><ImagePanel project={project} /></Link>}
    <Link to={`/projects/${project.slug}`} className="project-card-link">
    <div className="project-card-meta"><span>{project.category}</span><ArrowUpRight size={17}/></div>
    <h3>{project.title}</h3><p>{project.summary}</p><p className="project-role">담당 · {project.role}</p>
    {project.docs?.length ? <p className="project-docs"><FileText size={14} strokeWidth={1.8} aria-hidden="true" /><span>문서화</span>{project.docs.map(doc => doc.title).join(' · ')}</p> : null}
    <div className="tag-list">{project.tags.slice(0,4).map(tag => <span className="tag" key={tag}>{tag}</span>)}</div>
    </Link>
  </motion.article>;
}

function AboutMe() {
  const fields = [
    { label: '이름', value: profile.name, Icon: UserRound },
    { label: '생년월일', value: profile.birthDate, Icon: CalendarDays },
    { label: '위치', value: profile.location, Icon: MapPin },
    { label: '연락처', value: profile.phone, Icon: Phone },
    { label: '이메일', value: profile.email, Icon: Mail },
    { label: '학력', value: profile.education, Icon: GraduationCap },
  ];
  // 값을 채운 항목만 보여줍니다. 빈 칸("—")이 미완성처럼 보이지 않도록 profile.ts에서 채우면 자동으로 나타납니다.
  const filled = fields.filter(field => field.value.trim());
  return <section className="about-section page-width" id="about" aria-labelledby="about-heading">
    <div className="about-layout">
      <div className="about-text">
        <div className="about-heading"><span className="section-label">PROFILE</span><h2 id="about-heading">ABOUT ME</h2></div>
        {profile.introduction.trim() && <p className="about-introduction">{profile.introduction}</p>}
        <dl className="profile-grid">
          {filled.map(({ label, value, Icon }) => <div className="profile-item" key={label}>
            <Icon className="profile-icon" size={20} strokeWidth={1.6} aria-hidden="true" />
            <div><dt>{label}</dt><dd>{label === '이메일' ? <a href={`mailto:${value}`}>{value}</a> : value}</dd></div>
          </div>)}
        </dl>
      </div>
      <ProfileBadge />
    </div>
  </section>;
}

const featuredSlugs = ['woodpecker', 'cinetrip', 'emotional-music', 'team-cucumber'];
const featuredProjects = featuredSlugs.flatMap(slug => projects.filter(project => project.slug === slug));
const otherProjects = projects.filter(project => !featuredSlugs.includes(project.slug));

function Home() {
  const [showMore, setShowMore] = useState(false);
  const location = useLocation();
  useLayoutEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    // Explicit section links still work, without a delayed smooth scroll during the intro.
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
  }, [location.hash, location.key]);
  return <main>
    <HeroIntro github={userGitHub} />

    <AboutMe />

    <section className="section projects-section" id="projects">
      <ProjectShowcase featured={featuredProjects.length} total={projects.length} />
      <div className="page-width">
      <div className="project-grid">{featuredProjects.map((project, index) => <ProjectCard key={project.slug} project={project} order={index}/>)}</div>
      {otherProjects.length > 0 && <>
        <div className="projects-toggle-row">
          <button className="projects-toggle" type="button" aria-expanded={showMore} aria-controls="other-projects" onClick={() => setShowMore(value => !value)}>
            {showMore ? 'Show less' : `Show more (${otherProjects.length})`}<span aria-hidden="true">{showMore ? '−' : '+'}</span>
          </button>
        </div>
        <div id="other-projects" hidden={!showMore}>
          {showMore && <><h3 className="other-projects-heading">Other Projects</h3><div className="project-grid">{otherProjects.map((project, index) => <ProjectCard key={project.slug} project={project} order={index}/>)}</div></>}
        </div>
      </>}
    </div></section>

    <section className="section skills-section" id="skills"><div className="page-width skills-layout">
      <div className="skills-intro"><div className="section-label">02 / TECH STACK</div><h2>Tools &amp;<br/><span>Technologies.</span></h2><p>프로젝트에서 직접 사용하며 경험을 쌓은 기술입니다.</p></div>
      <div className="skills-grid">
        <SkillBox n="01" title="Frontend" items={['TypeScript', 'JavaScript', 'React', 'Next.js (App Router)', 'Tailwind CSS', 'TanStack Query', 'Zustand', 'TipTap']} />
        <SkillBox n="02" title="Backend & Database" items={['Node.js', 'Express', 'NestJS', 'Supabase', 'PostgreSQL (RLS · RPC)', 'MySQL / TypeORM', 'JWT']} />
        <SkillBox n="03" title="APIs & Integrations" items={['OpenAI API', 'Web Push / Service Worker', 'TMDB API', 'iTunes Search API', 'Zod']} />
        <SkillBox n="04" title="Testing & DevOps" items={['Vitest', 'Testing Library', 'Playwright', 'pgTAP', 'GitHub Actions', 'Vercel', 'Git / GitHub']} />
      </div>
    </div></section>

    <section className="section journey-section" id="journey"><div className="page-width">
      <div className="section-heading"><div><div className="section-label">03 / BACKGROUND</div><h2>Learning <span>Journey.</span></h2><p>교육에서 프로젝트, 실제 개발 경험으로 이어온 과정입니다.</p></div></div>
      <div className="journey-grid">
        <div className="journey-panel"><div className="panel-top"><span>EDUCATION</span><span>01</span></div><Timeline items={education} /></div>
        <div className="journey-panel"><div className="panel-top"><span>EXPERIENCE & AWARDS</span><span>02</span></div><Timeline items={experience} /></div>
      </div>
    </div></section>

    <section className="contact-section" id="contact"><div className="page-width contact-inner"><div className="section-label">04 / GET IN TOUCH</div><h2>함께 만들어갈<span>기회를 찾고 있습니다.</span></h2><p>프로젝트 구현 과정과 소스코드는 GitHub에서 확인할 수 있습니다.</p><div className="contact-actions">
      <a className="contact-btn" href={userGitHub} target="_blank" rel="noreferrer"><Github size={20}/> GitHub 방문하기 <ArrowUpRight size={18}/></a>
      {contact.email.trim() && <a className="contact-btn" href={`mailto:${contact.email}`}><Mail size={20}/> {contact.email}</a>}
      {contact.resumeUrl.trim() && <a className="contact-btn" href={contact.resumeUrl} target="_blank" rel="noreferrer"><FileText size={20}/> 이력서 PDF <ArrowUpRight size={18}/></a>}
      {contact.techDocUrl.trim() && <a className="contact-btn" href={contact.techDocUrl} target="_blank" rel="noreferrer"><FileText size={20}/> 프로젝트 기술서 PDF <ArrowUpRight size={18}/></a>}
    </div></div></section>
  </main>;
}

function Timeline({ items }: { items: TimelineItem[] }) {
  return <div className="timeline">{items.map(item => <div className="timeline-row" key={item.title}>
    <div className="timeline-marker"/>
    <div><div className="timeline-eyebrow">{item.eyebrow}{item.period.trim() && <span className="timeline-period">{item.period}</span>}</div><h3>{item.title}</h3><p>{item.description}</p></div>
  </div>)}</div>;
}

const solvingKind = { issue: '문제 해결', design: '설계 고려' } as const;

function SolvingList({ project }: { project: Project }) {
  if (!project.solving?.length) return null;
  return <section className="detail-group"><div className="section-label">PROBLEM SOLVING</div><h2>문제 해결 및 설계 고려</h2>
    <div className="solving-list">{project.solving.map(item => <article className={`solving-item solving-${item.kind}`} key={item.title}>
      <span className="solving-kind">{solvingKind[item.kind]}</span>
      <h3>{item.title}</h3>
      <dl>
        <dt>{item.kind === 'issue' ? '문제' : '상황'}</dt><dd>{item.problem}</dd>
        {item.cause && <><dt>원인</dt><dd>{item.cause}</dd></>}
        <dt>{item.kind === 'issue' ? '해결' : '대응'}</dt><dd>{item.solution}</dd>
        {item.result && <><dt>결과</dt><dd>{item.result}</dd></>}
      </dl>
    </article>)}</div>
  </section>;
}

function DesignBoards({ project }: { project: Project }) {
  if (!project.boards?.length) return null;
  return <section className="detail-group"><div className="section-label">DESIGN</div><h2>화면 설계</h2>
    <p className="docs-intro">Figma로 서비스 전체 와이어프레임과 UI를 직접 설계했습니다. 화면 사이의 이동 흐름까지 연결해 두고, 팀은 이 설계를 기준으로 기능과 API 범위를 나눠 개발했습니다.</p>
    {project.boards.map(board => <BoardViewer key={board.src} board={board} />)}
  </section>;
}

function DocList({ project }: { project: Project }) {
  if (!project.docs?.length) return null;
  return <section className="detail-group"><div className="section-label">DOCUMENTATION</div><h2>문서화</h2>
    <p className="docs-intro">구현만큼 중요하게 생각한 부분입니다. 팀원이 같은 기준으로 개발하고, 나중에 코드를 읽는 사람이 결정의 이유를 알 수 있도록 직접 작성한 문서입니다.</p>
    <div className="doc-list">{project.docs.map((doc, index) => <motion.a className="doc-card" key={doc.url} href={doc.url} target="_blank" rel="noreferrer"
      initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}>
      <div className={`doc-sheet doc-sheet-${doc.preview ?? 'outline'}`} aria-hidden="true">
        <div className="doc-sheet-bar"><i/><i/><i/><span>{doc.path}</span></div>
        {doc.preview === 'tree'
          ? <pre>{doc.outline.join('\n')}</pre>
          : <ol>{doc.outline.map(line => <li key={line}>{line}</li>)}</ol>}
      </div>
      <div className="doc-body">
        <div className="doc-title"><FileText size={17} strokeWidth={1.7} aria-hidden="true" /><h3>{doc.title}</h3><ArrowUpRight size={17} className="doc-arrow" aria-hidden="true" /></div>
        <p>{doc.summary}</p>
        {doc.note && <p className="doc-note">{doc.note}</p>}
      </div>
    </motion.a>)}</div>
  </section>;
}

function ScreenList({ project }: { project: Project }) {
  if (!project.screens?.length) return null;
  return <section className="detail-group"><div className="section-label">SCREENS</div><h2>주요 화면</h2>
    <div className="diagram-grid">{project.screens.map(diagram => <figure key={diagram.src}>
      <a href={asset(diagram.src)} target="_blank" rel="noreferrer"><img src={asset(diagram.src)} alt={diagram.label} loading="lazy" /></a>
      <figcaption>{diagram.label}</figcaption>
    </figure>)}</div>
  </section>;
}

function SkillBox({n,title,items}:{n:string;title:string;items:string[]}) {return <div className="skill-box"><div className="skill-title"><span>{n}</span><h3>{title}</h3></div><div className="tag-list">{items.map(item=><span className="tag" key={item}>{item}</span>)}</div></div>}

function ProjectDetail() {
  const {slug} = useParams();
  const project = projects.find(p => p.slug === slug);
  useEffect(() => {window.scrollTo(0,0)}, [slug]);
  if (!project) return <main className="notfound page-width"><h1>프로젝트를 찾을 수 없습니다.</h1><Link to="/">홈으로 돌아가기 <ArrowRight size={16}/></Link></main>;
  const i = projects.indexOf(project);
  const next = projects[(i+1)%projects.length];
  return <main className="project-detail page-width">
    <Link to="/#projects" className="back-link"><ArrowLeft size={17}/> 모든 프로젝트</Link>
    <div className="detail-heading"><div className="section-label">PROJECT {project.index} <span className="eyebrow-divider">/</span> {project.category}</div><h1>{project.title}</h1><p>{project.subtitle}</p><div className="detail-chips">{project.tags.map(tag=><span className="tag" key={tag}>{tag}</span>)}</div></div>
    <ImagePanel project={project} detail />
    <div className="detail-layout"><aside className="detail-aside"><div className="aside-block"><span>PROJECT TYPE</span><b>{project.category}</b></div><div className="aside-block"><span>MY ROLE</span><b>{project.role}</b></div><div className="aside-block"><span>TECHNOLOGIES</span><div className="tag-list">{project.tags.map(t=><span className="tag" key={t}>{t}</span>)}</div></div>{project.period?.trim() && <div className="aside-block"><span>PERIOD</span><b>{project.period}</b></div>}{project.team?.trim() && <div className="aside-block"><span>TEAM</span><b>{project.team}</b></div>}{project.github && <a className="detail-github" href={project.github} target="_blank" rel="noreferrer"><Github size={18}/> 프로젝트 저장소 <ArrowUpRight size={17}/></a>}</aside>
      <div className="detail-body">
        <section className="detail-group"><div className="section-label">OVERVIEW</div><h2>프로젝트 소개</h2><p>{project.description}</p></section>
        <DesignBoards project={project} />
        <section className="detail-group"><div className="section-label">MY CONTRIBUTION</div><h2>담당 업무</h2><ul className="feature-list">{project.features.map((feature,index)=><li key={feature}><span>{String(index+1).padStart(2,'0')}</span>{feature}</li>)}</ul></section>
        <DocList project={project} />
        <ScreenList project={project} />
        <SolvingList project={project} />
        {project.repositoryNote && <section className="detail-group"><div className="section-label">REPOSITORY</div><h2>저장소 안내</h2><p>{project.repositoryNote}</p></section>}
        {project.resources && <section className="detail-group"><div className="section-label">RESOURCES</div><h2>프로젝트 자료</h2><div className="project-resources">{project.resources.map(resource => <a className="detail-github" key={resource.url} href={resource.url} target="_blank" rel="noreferrer">{resource.label}<ArrowUpRight size={17}/></a>)}</div></section>}
      </div>
    </div>
    <div className="next-project"><span>NEXT PROJECT</span><Link to={`/projects/${next.slug}`}>{next.title}<ArrowUpRight size={25}/></Link></div>
  </main>;
}

function Footer(){return <footer className="site-footer"><div className="page-width footer-inside"><span>© 2026 HYE MIN KWAK</span><span>BUILT WITH CURIOSITY & CODE.</span><a href={userGitHub} target="_blank" rel="noreferrer">GITHUB <ExternalLink size={12}/></a></div></footer>}

export default function App() {
  const location=useLocation();
  useEffect(()=>{document.title= location.pathname.startsWith('/projects/') ? `${projects.find(p=>location.pathname.endsWith(p.slug))?.title??'Project'} | 곽혜민` : '곽혜민 | Full-Stack Developer'},[location.pathname]);
  return <><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/projects/:slug" element={<ProjectDetail/>}/><Route path="*" element={<main className="notfound page-width"><h1>페이지를 찾을 수 없습니다.</h1><Link to="/">홈으로 돌아가기 <ArrowRight size={16}/></Link></main>}/></Routes><Footer/></>;
}
