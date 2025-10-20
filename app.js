/* =========
   Utilities
   ========= */
function money(n){
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  return sign + '$' + (isFinite(n)? n.toLocaleString(undefined,{maximumFractionDigits:2,minimumFractionDigits:2}) : '0.00');
}
function toAnnualEffective(rate, ratePer){
  if(ratePer==='annual') return (rate||0)/100;
  return Math.pow(1 + ((rate||0)/100), 12) - 1; // monthly nominal -> annual effective
}
function parseMoney(txt){ if(!txt) return 0; const s = (''+txt).replace(/[^0-9.-]/g,''); return parseFloat(s)||0; }

/* =========================
   Card templates (HTML)
   ========================= */
function savingsCard(i,label){
  return `
  <div class="card" id="b${i}">
    <div class="title"><strong>Savings ${'ABCD'[i]} —</strong><input id="name${i}" value="${label}"/></div>
    <div class="card-body">
      <label class="label-starting">Starting balance</label>
      <input class="num" id="init${i}" type="number" step="0.01" placeholder="e.g., 10000"/>

      <div class="row">
        <div><label>Interest rate</label><input class="num" id="rate${i}" type="number" step="0.01" placeholder="e.g., 7"/></div>
        <div><label>Rate Period (%)</label><select id="ratePer${i}">
          <option value="annual" selected>Annual</option><option value="monthly">Monthly</option></select></div>
      </div>

      <div class="row">
        <div><label>Contribution</label><input class="num" id="pmt${i}" type="number" step="0.01" placeholder="e.g., 2000"/></div>
        <div><label>Frequency</label><select id="pmtFreq${i}">
          <option value="annual">Annual</option><option value="monthly" selected>Monthly</option></select></div>
      </div>

      <div class="row">
        <div><label>Years</label><input class="num" id="years${i}" type="number" step="1" placeholder="e.g., 20"/></div>
        <div><label>Compound frequency</label><select id="comp${i}">
          <option value="annual" selected>Annual</option><option value="monthly">Monthly</option></select></div>
      </div>

      ${i===0 ? `
      <div class="match-block">
        <div class="tiny">Company match (optional)</div>
        <div class="row">
          <div><label>Salary (annual)</label><input class="num" id="salary0" type="number" step="0.01" placeholder="e.g., 100000"/></div>
          <div><label>Company contrib (%)</label><input class="num" id="matchPct0" type="number" step="0.01" placeholder="e.g., 4"/></div>
        </div>
        <div class="sumline tiny"><span>Employer contrib (monthly)</span><span id="employerMonthly0">$0.00</span></div>
      </div>
      ` : ``}
    </div>

    <div class="card-footer">
      <div class="sumline tiny"><span>Total contributions</span><span id="tc${i}">$0</span></div>
      <div class="sumline tiny"><span>Total interest</span><span id="ti${i}">$0</span></div>
      <div class="gap"></div>
      <div class="sumline"><span><strong>Total</strong></span><strong id="tg${i}">$0</strong></div>
    </div>
  </div>`;
}

function retirementCard(i,label){
  return `
  <div class="card green" id="g${i}">
    <div class="title"><strong>Retirement ${'ABCD'[i]} —</strong><input id="gname${i}" value="${label}"/></div>

    <div class="card-body">
      <label class="label-starting">Starting balance</label>
      <input class="num" id="ginit${i}" type="number" step="0.01" placeholder="Total from Savings ${'ABCD'[i]}" disabled/>

      <div class="lockrow">
        <span>Uncheck to unlock; check to reset</span>
        <input type="checkbox" id="unlock${i}" checked>
      </div>

      <div class="row">
        <div><label>Interest rate</label><input class="num" id="grate${i}" type="number" step="0.01" placeholder="e.g., 7"/></div>
        <div><label>Rate Period (%)</label><select id="gratePer${i}">
          <option value="annual" selected>Annual</option><option value="monthly">Monthly</option></select></div>
      </div>

      <div class="row">
        <div><label>Withdrawal</label><input class="num" id="gpmt${i}" type="number" step="0.01" placeholder="e.g., 5000"/></div>
        <div><label>Frequency</label><select id="gpmtFreq${i}">
          <option value="annual">Annual</option><option value="monthly" selected>Monthly</option></select></div>
      </div>

      <div class="row">
        <div><label>Years</label><input class="num" id="gyears${i}" type="number" step="1" placeholder="e.g., 30"/></div>
        <div><label>Compound frequency</label><select id="gcomp${i}">
          <option value="annual" selected>Annual</option><option value="monthly">Monthly</option></select></div>
      </div>
    </div>

    <div class="card-footer">
      <!-- Depletion banner in footer; spacing below controlled by CSS -->
      <div class="deplete" id="gdep${i}">
        <div>Time until balance reaches zero</div>
        <div>more than 40 years</div>
      </div>

      <div class="sumline tiny"><span>Total withdrawals</span><span id="gtc${i}">$0</span></div>
      <div class="sumline tiny"><span>Total interest</span><span id="gti${i}">$0</span></div>
      <div class="gap"></div>
      <div class="sumline"><span><strong>Total</strong></span><strong id="gtg${i}">$0</strong></div>
    </div>
  </div>`;
}

const totalBlue = `
  <div class="card" id="total-blue">
    <div class="title"><strong>Total</strong><span class="pill">USD</span></div>
    <div class="sumline"><span>Combined initial</span><strong id="sumInitB">$0</strong></div>
    <div class="sumline"><span>Combined contributions</span><strong id="sumContribB">$0</strong></div>
    <div class="sumline"><span>Combined interest</span><strong id="sumInterestB">$0</strong></div>
    <hr style="border:0;border-top:1px solid #fff">
    <div><div class="pfv-label">Projected future value</div><div class="sumline pfv-value"><span></span><strong id="sumFVB">$0</strong></div></div>
  </div>`;
const totalGreen = `
  <div class="card green" id="total-green">
    <div class="title"><strong>Total</strong><span class="pill">USD</span></div>
    <div class="sumline"><span>Combined initial</span><strong id="sumInitG">$0</strong></div>
    <div class="sumline"><span>Combined withdrawals</span><strong id="sumContribG">$0</strong></div>
    <div class="sumline"><span>Combined interest</span><strong id="sumInterestG">$0</strong></div>
    <hr style="border:0;border-top:1px solid #fff">
    <div><div class="pfv-label">Projected future value</div><div class="sumline pfv-value"><span></span><strong id="sumFVG">$0</strong></div></div>
  </div>`;

/* =========================
   Mount UI
   ========================= */
const gridBlue  = document.getElementById('grid-blue');
const gridGreen = document.getElementById('grid-green');

gridBlue.insertAdjacentHTML('beforeend', [
  savingsCard(0,'401k'),
  savingsCard(1,'IRA'),
  savingsCard(2,'RSUs'),
  savingsCard(3,'Other'),
  totalBlue
].join(''));

gridGreen.insertAdjacentHTML('beforeend', [
  retirementCard(0,'401k'),
  retirementCard(1,'IRA'),
  retirementCard(2,'RSUs'),
  retirementCard(3,'Other'),
  totalGreen
].join(''));

/* =========================
   Calculation engine
   ========================= */
function stepSim({init, rate, ratePer, pmt, pmtFreq, comp, years}){
  const rA = toAnnualEffective(rate, ratePer);
  const rM = (comp==='annual') ? Math.pow(1 + rA, 1/12) - 1 : (ratePer==='annual' ? (rate||0)/100/12 : (rate||0)/100);
  const months = Math.max(0, Math.round((+years||0)*12));
  let bal = +init||0, total=0;
  for(let m=1;m<=months;m++){
    bal *= (1 + rM);
    if(pmtFreq==='monthly'){ bal += pmt; total += pmt; }
    if(pmtFreq==='annual' && m%12===0){ bal += pmt; total += pmt; }
  }
  const interest = bal - init - total;
  return {fv: bal, total, interest};
}

function readBlue(i){
  const valNZ = (v)=> Math.max(0,(+v||0));
  const base = {
    init: valNZ(document.getElementById('init'+i).value),
    rate: +document.getElementById('rate'+i).value||0,
    ratePer: document.getElementById('ratePer'+i).value,
    pmt: valNZ(document.getElementById('pmt'+i).value),
    pmtFreq: document.getElementById('pmtFreq'+i).value,
    comp: document.getElementById('comp'+i).value,
    years: +document.getElementById('years'+i).value||0
  };
  if(i===0){
    const salary = +document.getElementById('salary0').value||0;
    const matchPct = +document.getElementById('matchPct0').value||0;
    base.employerMonthly = (salary*(matchPct/100))/12;
  }
  return base;
}
function calcBlue(i, base){
  const extra = (i===0 && base.employerMonthly)? base.employerMonthly : 0;
  const months = Math.max(0, Math.round((+base.years||0)*12));
  const rA = toAnnualEffective(base.rate, base.ratePer);
  const rM = (base.comp==='annual') ? Math.pow(1 + rA, 1/12) - 1 : (base.ratePer==='annual' ? (base.rate||0)/100/12 : (base.rate||0)/100);
  let bal = base.init, totalContrib = 0;
  for(let m=1;m<=months;m++){
    bal *= (1 + rM);
    if(base.pmtFreq==='monthly'){ bal += base.pmt; totalContrib += base.pmt; }
    if(base.pmtFreq==='annual' && m%12===0){ bal += base.pmt; totalContrib += base.pmt; }
    if(extra){ bal += extra; totalContrib += extra; }
  }
  const interest = bal - base.init - totalContrib;
  return {fv: bal, totalContrib, interest};
}

function readGreen(i){
  return {
    init: +document.getElementById('ginit'+i).value||0,
    rate: +document.getElementById('grate'+i).value||0,
    ratePer: document.getElementById('gratePer'+i).value,
    pmt: +document.getElementById('gpmt'+i).value||0,
    pmtFreq: document.getElementById('gpmtFreq'+i).value,
    comp: document.getElementById('gcomp'+i).value,
    years: +document.getElementById('gyears'+i).value||0
  };
}
function calcGreen(base){
  const engineBase = {...base};
  const withdraw = +(base.pmt||0);
  engineBase.pmt = -withdraw; // withdrawals are negative in the engine

  const rA = toAnnualEffective(engineBase.rate, engineBase.ratePer);
  const rM = (engineBase.comp==='annual') ? Math.pow(1 + rA, 1/12) - 1 : (engineBase.ratePer==='annual' ? (engineBase.rate||0)/100/12 : (engineBase.rate||0)/100);
  const months = Math.max(0, Math.round((+engineBase.years||0)*12));
  let bal = +engineBase.init||0, total=0;

  for(let m=1;m<=months;m++){
    bal *= (1 + rM);
    if(engineBase.pmtFreq==='monthly'){ bal += engineBase.pmt; total += Math.abs(engineBase.pmt); }
    if(engineBase.pmtFreq==='annual' && m%12===0){ bal += engineBase.pmt; total += Math.abs(engineBase.pmt); }
  }
  const interest = bal - engineBase.init + total;

  // depletion horizon (40y)
  const horizon = 40*12;
  let b2 = +engineBase.init||0, hit=null;
  for(let m=1;m<=horizon;m++){
    b2 *= (1 + rM);
    if(engineBase.pmtFreq==='monthly'){ b2 += engineBase.pmt; }
    if(engineBase.pmtFreq==='annual' && m%12===0){ b2 += engineBase.pmt; }
    if(b2 < 0 && hit===null){ hit=m; break; }
  }
  return {fv: bal, totalWithdrawals: total, interest, depleteMonths: hit};
}

/* Sync green starts when locked (checked) */
function syncGreenStarts(){
  for(let i=0;i<4;i++){
    const locked = document.getElementById('unlock'+i).checked;
    if(locked){
      const blueFV = parseMoney(document.getElementById('tg'+i).textContent);
      document.getElementById('ginit'+i).value = isNaN(blueFV)? '' : blueFV;
    }
  }
}

/* Master update */
function update(){
  // BLUE
  let sumInitB=0,sumContribB=0,sumInterestB=0,sumFVB=0;
  for(let i=0;i<4;i++){
    const inp = readBlue(i);
    if(i===0){
      const employerMonthly = inp.employerMonthly||0;
      document.getElementById('employerMonthly0').textContent = money(employerMonthly);
    }
    const out = calcBlue(i, inp);
    sumInitB += inp.init; sumContribB += out.totalContrib; sumInterestB += out.interest; sumFVB += out.fv;
    document.getElementById('tc'+i).textContent = money(out.totalContrib);
    document.getElementById('ti'+i).textContent = money(out.interest);
    document.getElementById('tg'+i).textContent = money(out.fv);
  }
  document.getElementById('sumInitB').textContent = money(sumInitB);
  document.getElementById('sumContribB').textContent = money(sumContribB);
  document.getElementById('sumInterestB').textContent = money(sumInterestB);
  document.getElementById('sumFVB').textContent = money(sumFVB);

  // sync green starts if locked
  syncGreenStarts();

  // GREEN
  let sumInitG=0,sumWithdrawG=0,sumInterestG=0,sumFVG=0;
  for(let i=0;i<4;i++){
    const ginp = readGreen(i);
    sumInitG += ginp.init;
    const gout = calcGreen(ginp);
    sumWithdrawG += gout.totalWithdrawals;
    sumInterestG += gout.interest;
    sumFVG += gout.fv;

    document.getElementById('gtc'+i).textContent = money(gout.totalWithdrawals);
    document.getElementById('gti'+i).textContent = money(gout.interest);
    document.getElementById('gtg'+i).textContent = money(gout.fv);

    const dep = document.getElementById('gdep'+i);
    if(gout.depleteMonths && gout.depleteMonths <= 40*12){
      const yrs=Math.floor(gout.depleteMonths/12), mos=gout.depleteMonths%12;
      dep.innerHTML = `<div>Time until balance reaches zero</div><div>${yrs} year${yrs!==1?'s':''}${mos?` and ${mos} month${mos!==1?'s':''}`:''}</div>`;
    }else{
      dep.innerHTML = `<div>Time until balance reaches zero</div><div>more than 40 years</div>`;
    }
  }
  document.getElementById('sumInitG').textContent = money(sumInitG);
  document.getElementById('sumContribG').textContent = money(sumWithdrawG);
  document.getElementById('sumInterestG').textContent = money(sumInterestG);
  document.getElementById('sumFVG').textContent = money(sumFVG);
}

/* Events */
['input','change'].forEach(ev=>document.addEventListener(ev,e=>{
  if(e.target.matches('input,select')) update();
}));

for(let i=0;i<4;i++){
  document.addEventListener('change', (e)=>{
    if(e.target && e.target.id === 'unlock'+i){
      const locked = document.getElementById('unlock'+i).checked; // checked = locked/reset
      const el = document.getElementById('ginit'+i);
      el.disabled = locked;
      if(locked) syncGreenStarts(); // on re-lock, pull from Savings again
      update();
    }
  });
}

document.getElementById('reset').addEventListener('click',()=>{
  // clear blue
  for(let i=0;i<4;i++){
    ['init','rate','pmt','years'].forEach(k=>{ document.getElementById(k+i).value=''; });
    document.getElementById('ratePer'+i).value='annual';
    document.getElementById('pmtFreq'+i).value='monthly';
    document.getElementById('comp'+i).value='annual';
  }
  document.getElementById('salary0').value='';
  document.getElementById('matchPct0').value='';
  document.getElementById('employerMonthly0').textContent = money(0);

  // clear green (re-lock & resync)
  for(let i=0;i<4;i++){
    document.getElementById('unlock'+i).checked=true; // locked
    const el = document.getElementById('ginit'+i); el.disabled=true; el.value='';
    ['grate','gpmt','gyears'].forEach(k=>{ document.getElementById(k+i).value=''; });
    document.getElementById('gratePer'+i).value='annual';
    document.getElementById('gpmtFreq'+i).value='monthly';
    document.getElementById('gcomp'+i).value='annual';
  }
  update();
});

/* Kickoff */
update();
