
  let expression = '';
  let lastResult = null;
  let memory     = 0;
  let angleMode  = 'DEG'; // 'DEG' | 'RAD'
  let shift      = false;
  let justCalc   = false;

  const display = document.getElementById('display');
  const expr    = document.getElementById('expr');

  
  function updateDisplay(val, isError = false) {
    display.textContent = val;
    display.className   = 'display-main' + (isError ? ' error' : '');
  }

  function updateExpr(val) { expr.textContent = val; }

  function flashDisplay() {
    display.style.opacity = '0.3';
    setTimeout(() => display.style.opacity = '1', 100);
  }

  
  function appendDisplay(val) {
    if (justCalc) {
      // After = pressed: continue with result for operators, else start fresh
      if (['+','-','*','/','**'].includes(val)) {
        expression = String(lastResult);
      } else if (val !== '.' && !isNaN(val)) {
        expression = '';
      }
      justCalc = false;
    }

   
    const piE = { 'π': 'Math.PI', 'e': 'Math.E' };
    expression += piE[val] ?? val;

   
    let disp = expression
      .replace(/Math\.PI/g, 'π')
      .replace(/Math\.E/g, 'e')
      .replace(/\*\*/g, '^')
      .replace(/\*/g, '×')
      .replace(/\//g, '÷');
    updateDisplay(disp || '0');
    updateExpr('');
  }

  function clearAll() {
    expression = '';
    lastResult = null;
    justCalc   = false;
    updateDisplay('0');
    updateExpr('');
    flashDisplay();
  }

  function deleteLast() {
    if (justCalc) { clearAll(); return; }
    
    expression = expression.replace(/(Math\.PI|Math\.E|\*\*|\*|\/|\+|-|\(|\)|\d+\.?\d*\.?)$/, '');
    let disp = expression
      .replace(/Math\.PI/g, 'π')
      .replace(/Math\.E/g, 'e')
      .replace(/\*\*/g, '^')
      .replace(/\*/g, '×')
      .replace(/\//g, '÷');
    updateDisplay(disp || '0');
  }

 
  function calculate() {
    if (!expression) return;
    try {
      let evalExpr = expression;
     
      let result = Function('"use strict"; return (' + evalExpr + ')')();
      if (!isFinite(result)) throw new Error('Infinity or NaN');
      lastResult = result;
      let disp = expression
        .replace(/Math\.PI/g, 'π')
        .replace(/Math\.E/g, 'e')
        .replace(/\*\*/g, '^')
        .replace(/\*/g, '×')
        .replace(/\//g, '÷');
      updateExpr(disp + ' =');

      
      let formatted = Number.isInteger(result)
        ? result.toString()
        : parseFloat(result.toPrecision(12)).toString();
      updateDisplay(formatted);
      expression = String(result);
      justCalc   = true;
      flashDisplay();
    } catch(e) {
      updateDisplay('SYNTAX ERROR', true);
      updateExpr(expression.replace(/Math\.PI/g, 'π').replace(/Math\.E/g, 'e'));
      expression = '';
      justCalc   = false;
    }
  }

  function toRad(x) { return angleMode === 'DEG' ? x * Math.PI / 180 : x; }
  function fromRad(x) { return angleMode === 'DEG' ? x * 180 / Math.PI : x; }

  function toggleAngle() {
    angleMode = angleMode === 'DEG' ? 'RAD' : 'DEG';
    document.getElementById('angleBtn').textContent = angleMode;
    document.getElementById('tag-deg').classList.toggle('active', angleMode === 'DEG');
    document.getElementById('tag-rad').classList.toggle('active', angleMode === 'RAD');
  }

  
  function toggleShift() {
    shift = !shift;
    const btn = document.getElementById('shiftBtn');
    btn.classList.toggle('active', shift);
    document.getElementById('tag-2nd').classList.toggle('active', shift);
    document.getElementById('sinBtn').textContent = shift ? 'sin⁻¹' : 'sin';
    document.getElementById('cosBtn').textContent = shift ? 'cos⁻¹' : 'cos';
    document.getElementById('tanBtn').textContent = shift ? 'tan⁻¹' : 'tan';
  }

 
  function trig(fn) {
    applyFn(x => {
      if (shift) {
        // inverse
        let r = Math[`a${fn}`](x);
        shift = false; toggleShift(); // reset
        return fromRad(r);
      }
      return Math[fn](toRad(x));
    });
    if (shift) { shift = false; toggleShift(); }
  }

 
  function applyFn(fn) {
    let val = justCalc ? lastResult : parseFloat(getCurrentVal());
    if (isNaN(val)) { updateDisplay('ERROR', true); return; }
    try {
      let result = fn(val);
      if (!isFinite(result)) throw new Error();
      lastResult = result;
      let formatted = Number.isInteger(result)
        ? result.toString()
        : parseFloat(result.toPrecision(10)).toString();
      expression = String(result);
      updateDisplay(formatted);
      justCalc = true;
      flashDisplay();
    } catch(e) {
      updateDisplay('MATH ERROR', true);
      expression = '';
      justCalc = false;
    }
  }

  function getCurrentVal() {
   
    let m = expression.match(/(-?\d+\.?\d*)$/);
    return m ? m[1] : '0';
  }

  function logFn()    { applyFn(x => Math.log10(x)); }
  function lnFn()     { applyFn(x => Math.log(x));   }
  function sqrtFn()   { applyFn(x => Math.sqrt(x));  }
  function squareFn() { applyFn(x => x * x);          }
  function cubeFn()   { applyFn(x => x * x * x);      }
  function invFn()    { applyFn(x => 1 / x);          }
  function absFn()    { applyFn(x => Math.abs(x));    }
  function factFn()   {
    applyFn(x => {
      if (x < 0 || !Number.isInteger(x) || x > 170) throw new Error();
      let r = 1; for (let i = 2; i <= x; i++) r *= i; return r;
    });
  }

  function powFn() {
    if (!expression) return;
    expression += '**';
    let disp = expression.replace(/\*\*/g, '^').replace(/\*/g, '×').replace(/\//g, '÷');
    updateDisplay(disp);
    justCalc = false;
  }

  function percentFn() { applyFn(x => x / 100); }
  function negate()    { applyFn(x => -x); }

  
  function memStore()  {
    let val = justCalc ? lastResult : parseFloat(getCurrentVal());
    if (!isNaN(val)) memory = val;
  }
  function memRecall() {
    expression += String(memory);
    updateDisplay(expression.replace(/Math\.PI/g, 'π').replace(/Math\.E/g, 'e').replace(/\*\*/g, '^').replace(/\*/g, '×').replace(/\//g, '÷') || '0');
    justCalc = false;
  }
  function memClear()  { memory = 0; flashDisplay(); }


  document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') appendDisplay(e.key);
    else if (e.key === '.') appendDisplay('.');
    else if (e.key === '+') appendDisplay('+');
    else if (e.key === '-') appendDisplay('-');
    else if (e.key === '*') appendDisplay('*');
    else if (e.key === '/') { e.preventDefault(); appendDisplay('/'); }
    else if (e.key === '(') appendDisplay('(');
    else if (e.key === ')') appendDisplay(')');
    else if (e.key === '%') percentFn();
    else if (e.key === 'Enter' || e.key === '=') calculate();
    else if (e.key === 'Backspace') deleteLast();
    else if (e.key === 'Escape') clearAll();
  });