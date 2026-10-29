const menu=document.getElementById('navigation'),toggle=document.getElementById('menuToggle');toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'×':'☰'});document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='☰'}));const modal=document.getElementById('bookingModal');let lastFocus=null;function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';lastFocus?.focus()}document.querySelectorAll('[data-book]').forEach(b=>b.addEventListener('click',()=>{lastFocus=document.activeElement;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';modal.querySelector('input').focus()}));document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeModal));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeModal()});const date=document.getElementById('appointmentDate');date.min=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);document.getElementById('bookingForm').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const subject=encodeURIComponent('Appointment request — '+d.service);const body=encodeURIComponent(`Name: ${d.name}\nEmail: ${d.email}\nPhone: ${d.phone}\nPreferred date: ${d.date}\nService: ${d.service}\n\nPlease contact me to confirm availability.`);window.location.href=`mailto:hello@eversmile.example?subject=${subject}&body=${body}`});const quotes=[['“The whole experience felt warm, professional and reassuring. Every step was explained clearly.”','Sample Patient A'],['“The team made my visit comfortable from start to finish. A genuinely welcoming atmosphere.”','Sample Patient B'],['“Beautiful space, friendly people and a thoughtful approach to care.”','Sample Patient C']];let quoteIndex=0;function renderQuote(){document.getElementById('quoteText').textContent=quotes[quoteIndex][0];document.getElementById('quoteName').textContent=quotes[quoteIndex][1]}document.getElementById('prevQuote').onclick=()=>{quoteIndex=(quoteIndex+quotes.length-1)%quotes.length;renderQuote()};document.getElementById('nextQuote').onclick=()=>{quoteIndex=(quoteIndex+1)%quotes.length;renderQuote()};document.getElementById('year').textContent=new Date().getFullYear();const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;const el=entry.target,target=Number(el.dataset.count);if(matchMedia('(prefers-reduced-motion: reduce)').matches){el.textContent=target.toLocaleString();observer.unobserve(el);return}let start;function tick(now){start??=now;const t=Math.min((now-start)/1400,1);el.textContent=Math.round(target*(1-Math.pow(1-t,3))).toLocaleString();if(t<1)requestAnimationFrame(tick)}requestAnimationFrame(tick);observer.unobserve(el)})},{threshold:.3});document.querySelectorAll('[data-count]').forEach(el=>observer.observe(el));


// Motion layer: a single passive scroll listener and requestAnimationFrame for smooth updates.
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.header');
  const progress = document.getElementById('scrollProgress');
  const scenes = [...document.querySelectorAll('[data-parallax]')];
  const revealGroups = [
    ['.about-images','left'],['.about .section-copy','right'],
    ['.section-heading','up'],['.service-card','up'],['.stats-grid > div','up'],
    ['.why .section-copy','left'],['.why-image','right'],
    ['.team-grid article','up'],['.faq .section-copy','left'],
    ['.faq-items','right'],['.quote-box','scale'],['.cta-inner > div','left'],
    ['.cta-inner > img','right'],['.footer-grid > div','up']
  ];
  revealGroups.forEach(([selector,direction]) => {
    document.querySelectorAll(selector).forEach((node,index) => {
      node.dataset.reveal = direction;
      node.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 110}ms`);
    });
  });
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }, {rootMargin:'0px 0px -35px 0px',threshold:0.08});
    document.querySelectorAll('[data-reveal]').forEach(node => revealObserver.observe(node));
  } else document.querySelectorAll('[data-reveal]').forEach(node => node.classList.add('is-visible'));
  let raf = 0;
  function paintScroll() {
    raf = 0;
    const viewport = window.innerHeight;
    const scrolled = window.scrollY;
    header.classList.toggle('is-scrolled', scrolled > 12);
    const max = document.documentElement.scrollHeight - viewport;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(scrolled/max,1) : 0})`;
    if (reduceMotion.matches || window.innerWidth <= 700) {
      scenes.forEach(el => el.style.removeProperty('transform'));
      return;
    }
    for (const el of scenes) {
      const parent = el.closest('[data-parallax-scene]') || el.closest('section');
      if (!parent) continue;
      const box = parent.getBoundingClientRect();
      if (box.bottom < -100 || box.top > viewport + 100) continue;
      const speed = Math.max(-0.3,Math.min(0.3,Number(el.dataset.speed) || 0));
      const distance = (viewport/2 - (box.top+box.height/2))*speed;
      // Main image: preserve enlargement to cover extra pixels during movement.
      el.style.transform = `translate3d(0,${Math.max(-110,Math.min(110,distance))}px,0)${el.classList.contains('hero-photo') ? ' scale(1.055)' : ''}`;
    }
  }
  function requestPaint(){if(!raf) raf=requestAnimationFrame(paintScroll)}
  window.addEventListener('scroll',requestPaint,{passive:true});
  window.addEventListener('resize',requestPaint,{passive:true});
  reduceMotion.addEventListener?.('change',()=>{
    document.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('is-visible'));
    requestPaint();
  });
  requestPaint();
})();
