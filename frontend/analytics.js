// analytics.js - Gráficos de progreso y ranking (gratis con Chart.js + Firestore)
import { getRecentAttempts } from "./firebase.js";
import { getEvaluations, getEvaluationAttempts } from "./evaluations.js";
import { getFlashcards } from "./flashcards.js";

let chartAttemptsInstance = null;
let chartTopicsInstance = null;

async function refreshAnalytics() {
  try {
    const attempts = await getRecentAttempts(50).catch(()=>[]);
    const evalAttempts = await getEvaluationAttempts().catch(()=>[]);
    const flashcards = await getFlashcards().catch(()=>[]);
    // Intentos por semana (últimas 6 semanas)
    const now = new Date();
    const weeks = [];
    const counts = [];
    for (let i=5;i>=0;i--) {
      const d = new Date(now); d.setDate(now.getDate() - i*7);
      const label = `${d.getDate()}/${d.getMonth()+1}`;
      weeks.push(label);
      const weekStart = new Date(d); weekStart.setDate(d.getDate()-6);
      const cnt = [...attempts, ...evalAttempts].filter(a=>{
        const t = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds*1000 : 0);
        return t >= weekStart.getTime() && t <= d.getTime();
      }).length;
      counts.push(cnt);
    }
    const ctx1 = document.getElementById("chart-attempts");
    if (ctx1) {
      if (chartAttemptsInstance) chartAttemptsInstance.destroy();
      chartAttemptsInstance = new Chart(ctx1, {
        type: 'bar',
        data: { labels: weeks, datasets: [{ label: 'Intentos', data: counts, backgroundColor: 'rgba(59,130,246,0.7)', borderColor: '#3b82f6', borderWidth: 1, borderRadius: 6 }]},
        options: { responsive:true, plugins:{legend:{display:false}}, scales:{ y:{ beginAtZero:true, ticks:{ color:'#94a3b8', stepSize:1 }}, x:{ ticks:{ color:'#94a3b8'}}}}
      });
    }
    // Aciertos por materia (top 5)
    const perTopic = {};
    [...attempts, ...evalAttempts].forEach(a=>{
      const subj = a.subject || a.evaluationTitle || "General";
      if (!perTopic[subj]) perTopic[subj] = { total:0, correct:0 };
      // attempts tienen result, evalAttempts tienen correct/total
      if (a.result) { perTopic[subj].total+=1; if(a.result==='correct') perTopic[subj].correct+=1; }
      else if (a.correct!==undefined) { perTopic[subj].total+=a.total||0; perTopic[subj].correct+=a.correct||0; }
    });
    const top = Object.entries(perTopic).sort((a,b)=>b[1].total - a[1].total).slice(0,5);
    const labels2 = top.map(([k])=>k.slice(0,15));
    const data2 = top.map(([,v])=> v.total ? Math.round(v.correct/v.total*100) : 0);
    const ctx2 = document.getElementById("chart-topics");
    if (ctx2) {
      if (chartTopicsInstance) chartTopicsInstance.destroy();
      chartTopicsInstance = new Chart(ctx2, {
        type: 'doughnut',
        data: { labels: labels2, datasets: [{ data: data2, backgroundColor: ['#3b82f6','#06b6d4','#8b5cf6','#10b981','#f59e0b'], borderWidth: 0 }]},
        options: { responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:'#94a3b8', boxWidth:12, font:{ size:11}}}} }
      });
    }
    // Ranking / puntos
    const totalPoints = [...attempts, ...evalAttempts].reduce((a,x)=> a + (x.earnedPoints|| (x.result==='correct'?1:0)), 0);
    const flashcardsDue = flashcards.filter(c=>{
      const t = c.nextReview?.toMillis ? c.nextReview.toMillis() : (c.nextReview?.seconds ? c.nextReview.seconds*1000 : 0);
      return t <= Date.now();
    }).length;
    const rankEl = document.getElementById("analytics-ranking");
    if (rankEl) {
      const level = Math.floor(totalPoints/10)+1;
      rankEl.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:0.8rem">
          <div style="text-align:center;padding:0.8rem;background:rgba(59,130,246,0.08);border:1px solid var(--border-color);border-radius:10px">
            <div style="font-size:1.5rem;font-weight:800;color:var(--primary)">${totalPoints}</div>
            <div style="font-size:0.7rem;color:var(--text-muted)">Puntos totales</div>
          </div>
          <div style="text-align:center;padding:0.8rem;background:rgba(16,185,129,0.08);border:1px solid var(--border-color);border-radius:10px">
            <div style="font-size:1.5rem;font-weight:800;color:var(--success)">Nivel ${level}</div>
            <div style="font-size:0.7rem;color:var(--text-muted)">${10 - totalPoints%10} pts para siguiente nivel</div>
          </div>
          <div style="text-align:center;padding:0.8rem;background:rgba(139,92,246,0.08);border:1px solid var(--border-color);border-radius:10px">
            <div style="font-size:1.5rem;font-weight:800;color:var(--accent-purple)">${flashcardsDue}</div>
            <div style="font-size:0.7rem;color:var(--text-muted)">Flashcards por repasar</div>
          </div>
          <div style="text-align:center;padding:0.8rem;background:rgba(245,158,11,0.08);border:1px solid var(--border-color);border-radius:10px">
            <div style="font-size:1.5rem;font-weight:800;color:var(--warning)">${attempts.length + evalAttempts.length}</div>
            <div style="font-size:0.7rem;color:var(--text-muted)">Actividades</div>
          </div>
        </div>
        <div style="margin-top:0.8rem;font-size:0.75rem;color:var(--text-muted);text-align:center">¡Seguí sumando puntos rindiendo evaluaciones y repasando flashcards!</div>
      `;
    }
  } catch(e){ console.error(e); }
}

window.refreshAnalytics = refreshAnalytics;
