import { LANES, hhmm, minLabel, type Planned } from './kitchen-data';
import { taskUses, timelineBounds, timelineEvents, formatTimelineOffset } from './timeline-data';
import { t } from './en';
import './timeline.css';
/** The same schedule projection is used in the recipe card and the live Plan view. */
export function CookingTimeline({plan,now,relative=false,showSteps=false,translateTitles=false,totalLabel='Całość'}:{plan:Planned[];now?:number;relative?:boolean;showSteps?:boolean;translateTitles?:boolean;totalLabel?:string}){
 const {start,end,minutes}=timelineBounds(plan);
 if(!plan.length)return null;
 const span=end-start||1;
 const pos=(ms:number)=>Math.min(100,Math.max(0,(ms-start)/span*100));
 const label=(ms:number)=>relative?`${Math.round((ms-start)/60000)} min`:hhmm(ms);
 const events=timelineEvents(plan);
 return <section className="hc-timeline" aria-label={t('Rozkład czasu gotowania')}>
  <h3 className="hc-h3">{t('Rozkład czasu gotowania')}</h3>
  <p className="hc-timeline-total">{t(totalLabel)}: <b>{minLabel(minutes)}</b>{relative&&<> · {t('od rozpoczęcia')}</>}</p>
  <div className="hc-k-lanes" aria-hidden="true">
   {LANES.filter(l=>plan.some(task=>taskUses(task,l.id))).map(l=><div key={l.id} className="hc-k-lane">
    <span>{t(l.label)}</span><div>{plan.filter(task=>taskUses(task,l.id)).map(task=><i key={task.id} className={'l-'+l.id} style={{left:pos(task.start)+'%',width:`calc(${pos(task.end)-pos(task.start)}% - 2px)`}} title={`${task.title} · ${label(task.start)}–${label(task.end)}`}/>)}
     {now!==undefined&&now>start&&now<end&&<b className="hc-k-nowline" style={{left:pos(now)+'%'}}/>}
    </div>
   </div>)}
   <div className="hc-k-axis"><span>{label(start)}</span><span>{label(start+span/2)}</span><span>{label(end)}</span></div>
  </div>
  {showSteps&&<details className="hc-timeline-details"><summary>{t('Etapy i czasy')}</summary>
   <ol className="hc-timeline-steps">{plan.map(task=><li key={task.id}><b>{label(task.start)}–{label(task.end)}</b><span>{translateTitles?t(task.title):task.title}<small>{task.min} min · {t(LANES.find(l=>l.id===task.lane)!.label)}</small></span></li>)}</ol>
   {!!events.length&&<><h4>{t('Przypomnienia')}</h4><ul>{events.map(event=><li key={event.id}>{formatTimelineOffset(Math.round(event.minute*60))} · {translateTitles?t(event.label):event.label}</li>)}</ul></>}
  </details>}
 </section>;
}
